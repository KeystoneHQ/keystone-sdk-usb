import { Buffer } from 'buffer';
import { Actions } from './actions';
import { generateApduPackets, parseApduPacket } from './frame';
import { OFFSET_P1, USBPackageSize, OFFSET_INS } from './constants';
import { request } from './webusb';

export { Actions } from './actions';
export * from './webusb';

export class TransportWebUSB {
  device: Nullable<USBDevice>;
  endpoint = 3;

  constructor(device: USBDevice) {
    this.device = device;
  }

  async send(action: Actions, data: string) {
    if (!this.device?.opened) {
      console.error('device not opened or not exist');
      return null;
    }

    let result: any = null;
    try {
      const packages = generateApduPackets(action, data);
      do {
        const res = await this.device.transferOut(this.endpoint, packages[0]);
        if (res.status !== 'ok') throw new Error('response status not ok');
        packages.shift();
      } while (packages.length > 0);

      result = await this.receive(action);

    } catch (err) {
      this.device.close();
      console.error('send out error', err);
    }
    return result;
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
      const isCurrentAction = hasBuffer && !isBufferEmpty && new DataView(response.data.buffer).getUint8(OFFSET_INS) === action;
      if (!isCurrentAction) {
        continue;
      }
      shouldContinue = false;
      const buffer = Buffer.from(response.data.buffer);
      packagesBuffer.push(buffer);
      totalPackets = buffer[OFFSET_P1];
      counter += 1;
    } while (counter < totalPackets || shouldContinue);

    const dataArr = packagesBuffer
      .map((buffer) => parseApduPacket(buffer))
      .sort(({ packetIndex: a }, { packetIndex: b }) => a - b)
      .map(({ data }) => data);
    if (dataArr.length === 1) {
      return dataArr[0];
    }
    return dataArr.join('');
  }
}

let device: Nullable<USBDevice> = null;

const isInvalidDevice = (device: Nullable<USBDevice>) => {
  return device && device?.opened;
}

export default function createTransport() {
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