import { Actions, decode, encode, logMethod, TransportConfig, TransportHID } from '@keystonehq/hw-transport-usb';
import { USBInterfaceNumber, USBConfigurationValue, USBTimeout, MAXUSBPackets, USBPackageSize, OFFSET_INS, OFFSET_LC, OFFSET_P1, keystoneUSBVendorId } from '@keystonehq/hw-transport-usb';
import { generateRequestID, isEmpty, isString, isUint8Array, safeJSONparse, safeJSONStringify } from '@keystonehq/hw-transport-usb';
import { throwTransportError, Status, TransportError, ErrorInfo } from '@keystonehq/hw-transport-error';
import { Buffer } from 'buffer';


const keystoneDevices = [
  {
    vendorId: keystoneUSBVendorId,
  },
];


export class TransportWebUSB implements TransportHID {
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
      await this.isSupported();
      const devices = await this.getKeystoneDevices();
      let device: Nullable<USBDevice> = null;
      if (devices.length > 1) {
        device = await requestKeystoneDevice();
      } else {
        device = devices[0];
      }
      initializeDisconnectListener(device, config?.disconnectListener);
      return new TransportWebUSB(device, config);
    };
 
    static async getKeystoneDevices(): Promise<USBDevice[]> {
        const devices = await navigator.usb.getDevices();
        return devices.filter((d: USBDevice) => d.vendorId === keystoneUSBVendorId);
    }

    static async getFirstKeystoneDevice(): Promise<USBDevice> {
        const existingDevices = await this.getKeystoneDevices();
        if (existingDevices.length > 0) return existingDevices[0];
        return requestKeystoneDevice();
    }

    static async isSupported(): Promise<boolean> {
        if (!navigator?.usb || typeof navigator.usb.getDevices !== 'function') throwTransportError(Status.ERR_NOT_SUPPORTED);
        if (isEmpty(await this.getKeystoneDevices())) throwTransportError(Status.ERR_DEVICE_NOT_FOUND);
        return true;
    }
      
   
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
  
      if (!isUint8Array(data) && !isString(data)) {
        data = safeJSONStringify(data);
      }
  
      const requestID = generateRequestID();
  
      const packages = encode(action, requestID, data as Uint8Array | string);
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
  
      const result = decode(packagesBuffer);
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
  
    close = async () => {
      if (this.device?.opened) {
        await close(this.device);
      }
    };
  }
  

const initializeDisconnectListener = (
  device: USBDevice,
  disconnectListener?: (device: USBDevice) => void
): void => {
  const onDisconnect = (e: Event) => {
    if (device === (e as USBConnectionEvent).device) {
      disconnectListener && disconnectListener(device);
      close(device);
      navigator.usb.removeEventListener('disconnect', onDisconnect);
    }
  };

  navigator.usb.addEventListener('disconnect', onDisconnect);
};

export async function createKeystoneTransport(timeout = 100000) {
  if ((await TransportWebUSB.getKeystoneDevices()).length <= 0) {
    try {
      await TransportWebUSB.requestPermission();
    } catch (e) {
      throw new Error('USB_PERMISSION_NOT_AVAILABLE');
    }
  }
  const transport = await TransportWebUSB.connect({
    timeout,
  });
  await transport.close();
  return transport;
}

async function selectDefaultConfiguration(device: USBDevice): Promise<void> {
  if (device.configuration === null) {
    await device.selectConfiguration(USBConfigurationValue);
  }
}

async function requestKeystoneDevice(): Promise<USBDevice> {
  const device = await navigator.usb.requestDevice({
    filters: keystoneDevices,
  });
  return device;
}

const open = async (device: USBDevice): Promise<USBDevice> => {
  await device.open();
  await selectDefaultConfiguration(device);
  await gracefullyResetDevice(device);
  try {
    await device.claimInterface(USBInterfaceNumber);
  } catch (e: any) {
    await close(device);
    throw e;
  }

  return device;
};




async function gracefullyResetDevice(device: USBDevice): Promise<void> {
  try {
    await device.reset();
  } catch (err) {
    console.warn(err);
  }
}

const request = async (): Promise<USBDevice> => {
  const device = await requestKeystoneDevice();
  return await open(device);
};

const close = async (device: USBDevice): Promise<void> => {
  try {
    await device.releaseInterface(USBInterfaceNumber);
    await gracefullyResetDevice(device);
    await device.close();
  } catch (err) {
    console.warn(err);
  }
};
