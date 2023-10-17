import { Buffer } from 'buffer';
import { Actions } from './actions';
import { Status } from './status-code';
import { generateApduPackets, parseApduPacket } from './frame';
import { OFFSET_P1, USBPackageSize, OFFSET_INS, USBTimeout, MAXUSBPackets } from './constants';
import { request, close, open } from './webusb';
import { safeJSONStringify, safeJSONparse } from './helper';
import { throwTransportError, TransportError, ErrorInfo } from './error';

export { Actions } from './actions';
export * from './webusb';
export { Status as StatusCode } from './status-code';
export { Chain } from './chain';

export class TransportWebUSB {
  device: Nullable<USBDevice>;
  endpoint = 3;

  constructor(device: USBDevice) {
    this.device = device;
  }

  async send<T>(action: Actions, data: unknown): Promise<T> {
    if (!this.device?.opened) {
      throwTransportError(Status.ERR_DEVICE_NOT_OPENED);
    }

    if (typeof data !== 'string') {
      data = safeJSONStringify(data);
    }

    const packages = generateApduPackets(action, String(data));
    if (MAXUSBPackets < packages.length) {
      throwTransportError(Status.ERR_DATA_TOO_LARGE);
    }

    const timeout = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TransportError(ErrorInfo[Status.ERR_TIMEOUT], Status.ERR_TIMEOUT)), USBTimeout)
    );

    // eslint-disable-next-line no-async-promise-executor
    const sendRequest = new Promise<T>(async (resolve, reject) => {
      try {
        do {
          const res = await this.device!.transferOut(this.endpoint, packages[0]);
          if (res.status !== 'ok') throwTransportError(Status.ERR_RESPONSE_STATUS_NOT_OK);
          packages.shift();
        } while (packages.length > 0);

        resolve(await this.receive(action) as T);
      } catch (err) {
        reject(err);
      }
    });

    return Promise.race([sendRequest, timeout]);
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
      const isCurrentAction = hasBuffer && !isBufferEmpty &&
        new DataView(response.data.buffer).getUint16(OFFSET_INS) === action;
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
      throw new TransportError(`${safeJSONparse(result.data)?.payload ?? 'unknown error'}`, result.status ?? Status.RSP_FAILURE_CODE);
    }
    return safeJSONparse(result.data);
  };

  open = async () => {
    if (!this.device) {
      this.device = await request();
    }
    await open(this.device);
  };

  close = async () => this.device && close(this.device);
}

let device: Nullable<USBDevice> = null;

const isInvalidDevice = (device: Nullable<USBDevice>) => {
  return device && device?.opened;
};

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