import { Buffer } from 'buffer';
import { Actions } from './actions';
import { Status, throwTransportError, TransportError, ErrorInfo } from '@keystonehq/hw-transport-error';
import { generateEApduPackets, parseEApduPacket } from './frame';
import { OFFSET_P1, USBPackageSize, OFFSET_INS, OFFSET_LC, USBTimeout, MAXUSBPackets } from './constants';
import { requestKeystoneDevice, close, open, isSupported, getKeystoneDevices, request, initializeDisconnectListener } from './webusb';
import { safeJSONStringify, safeJSONparse, generateRequestID } from './helper';
import { logMethod } from './decorators';

export { Actions } from './actions';
export * from './webusb';
export { Status as StatusCode } from '@keystonehq/hw-transport-error';
export { Chain } from './chain';
export * from './decorators';

export interface TransportConfig {
  endpoint?: number;
  timeout?: number;
  maxPacketSize?: number;
  disconnectListener?: (device: USBDevice) => void;
}

export class TransportWebUSB {
  private device: Nullable<USBDevice>;
  private endpoint = 3;
  private requestTimeout = USBTimeout;
  private maxPacketSize = MAXUSBPackets;

  /**
   * The `requestPermission` static method is an asynchronous function that requests permission from the user to access a USB device.
   * It first checks if the WebUSB API is supported in the current environment.
   * Then, it requests access to a USB device.
   * After the device has been accessed, it is then closed.
   * In order to establish a connection with a USB device, the application must first request the user's permission.
   */
  static requestPermission = async () => await close(await request());

  /**
   * The `connect` static method is an asynchronous function that connects to a USB device.
   * It first checks if the WebUSB API is supported in the current environment.
   * Then, it retrieves a list of all USB devices that the application has permission to access using the `getKeystoneDevices` method.
   * The `getKeystoneDevices` method can only retrieve devices that the application has previously obtained permission to access using the `requestDevice` method.
   * Finally, it creates and returns a new `TransportWebUSB` object using the selected device.
   */
  static connect = async (config?: TransportConfig) => {
    await isSupported();
    const devices = await getKeystoneDevices();
    let device: Nullable<USBDevice> = null;
    if (devices.length > 1) {
      device = await requestKeystoneDevice();
    } else {
      device = devices[0];
    }
    initializeDisconnectListener(device, config?.disconnectListener);
    return new TransportWebUSB(device, config);
  };

  constructor(device: USBDevice, config?: TransportConfig) {
    this.endpoint = config?.endpoint ?? this.endpoint;
    this.requestTimeout = config?.timeout ?? this.requestTimeout;
    this.maxPacketSize = config?.maxPacketSize ?? this.maxPacketSize;
    this.device = device;
  }

  @logMethod
  async send<T>(action: Actions, data: unknown): Promise<T> {
    return await this.#send<T>(action, data).finally(async () => {
      await close(this.device!);
    });
  }

  async #send<T>(action: Actions, data: unknown): Promise<T> {
    await open(this.device!);
    if (!this.device?.opened) {
      throwTransportError(Status.ERR_DEVICE_NOT_OPENED);
    }

    if (typeof data !== 'string') {
      data = safeJSONStringify(data);
    }

    const requestID = generateRequestID();

    const packages = generateEApduPackets(action, requestID, String(data));
    if (this.maxPacketSize < packages.length) {
      throwTransportError(Status.ERR_DATA_TOO_LARGE);
    }

    let timeoutId: Nullable<NodeJS.Timeout>;
    const timeout = new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new TransportError(ErrorInfo[Status.ERR_TIMEOUT], Status.ERR_TIMEOUT)),
        this.requestTimeout);
    });

    const sendRequest = (async () => {
      try {
        do {
          const res = await this.device!.transferOut(this.endpoint, packages[0]);
          if (res.status !== 'ok') throwTransportError(Status.ERR_RESPONSE_STATUS_NOT_OK);
          packages.shift();
        } while (packages.length > 0);

        return await this.receive(action, requestID) as T;
      } finally {
        clearTimeout(timeoutId!);
      }
    })();

    return Promise.race([sendRequest, timeout]);
  }

  receive = async (action: Actions, requestID: number) => {
    if (!this.device?.opened) {
      return null;
    }
    const packagesBuffer: Buffer[] = [];
    let counter = 0;
    let totalPackets = 0;
    let shouldContinue = true;
    do {
      const response = await this.device.transferIn(this.endpoint, USBPackageSize);
      if (response.status === 'babble') {
        throwTransportError(Status.ERR_RECEIVED_BABBLE);
      }
      const hasBuffer = !!response?.data?.buffer;
      const isBufferEmpty = response?.data?.buffer?.byteLength === 0;
      const isCurrentAction = hasBuffer && !isBufferEmpty &&
        new DataView(response.data.buffer).getUint16(OFFSET_INS) === action &&
        new DataView(response.data.buffer).getUint16(OFFSET_LC) === requestID;
      if (!isCurrentAction) {
        await this.open();
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
      .map((buffer) => parseEApduPacket(buffer))
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
      this.device = await requestKeystoneDevice();
    }
    await open(this.device);
  };

  close = async () => this.device?.opened && close(this.device);
}
