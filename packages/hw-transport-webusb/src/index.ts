import { Buffer } from 'buffer';
import { Actions } from './actions';
import { Status } from './status_code';
import { generateApduPackets, parseApduPacket } from './frame';
import { OFFSET_P1, USBPackageSize, OFFSET_INS } from './constants';
import { request } from './webusb';
import { safeJSONparse } from './helper';

export { Actions } from './actions';
export * from './webusb';

export class TransportWebUSB {
  device: Nullable<USBDevice>;
  endpoint = 3;

  constructor(device: USBDevice) {
    this.device = device;
  }

  async send<T>(action: Actions, data: string) {
    if (!this.device?.opened) {
      throw new Error('device not opened or not exist');
    }

    const packages = generateApduPackets(action, data);
    do {
      const res = await this.device.transferOut(this.endpoint, packages[0]);
      if (res.status !== 'ok') throw new Error('response status not ok');
      packages.shift();
    } while (packages.length > 0);

    return await this.receive(action) as T;
  }

  receive = async (action: Actions) => {
    if (!this.device?.opened) {
      return null;
    }
    const packagesBuffer: Buffer[] = [];
    let counter = 0;
    let totalPackets = 0;
    let shouldContinue = true;
    do {
      const response = await this.device.transferIn(this.endpoint, USBPackageSize);
      const hasBuffer = !!response?.data?.buffer;
      const isBufferEmpty = response?.data?.buffer?.byteLength === 0;
      const isCurrentAction = hasBuffer && !isBufferEmpty && new DataView(response.data.buffer).getUint16(OFFSET_INS) === action;
      if (!isCurrentAction) {
        continue;
      }
      shouldContinue = false;
      packagesBuffer.push(Buffer.from(response.data.buffer));
      totalPackets = new DataView(response.data.buffer).getUint16(OFFSET_P1);
      counter += 1;
    } while (counter < totalPackets || shouldContinue);

    const result: {
      data: string,
      status?: Status
    } = packagesBuffer
      .map((buffer) => parseApduPacket(buffer))
      .sort(({ packetIndex: a }, { packetIndex: b }) => a - b)
      .reduce<{ data: string, status?: number }>((acc, { data, status }) =>
        ({ data: acc.data + data, status }), { data: '' });
    if (result.status !== Status.RSP_SUCCESS_CODE) {
      throw new Error(`[Device response error]: ${safeJSONparse(result.data)?.payload ?? 'unknown error'}`);
    }
    return safeJSONparse(result.data);
  }
}

let device: Nullable<USBDevice> = null;

const isInvalidDevice = (device: Nullable<USBDevice>) => {
  return device && device?.opened;
}

export default function createTransport() {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<TransportWebUSB>(async (resolve, reject) => {
    try {
      device = isInvalidDevice(device) ? device as USBDevice : await request();
      const transport = new TransportWebUSB(device);
      resolve(transport);
    } catch (err) {
      device = null;
      reject(err);
    }
  });
}