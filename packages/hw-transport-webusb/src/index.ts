import {
  isSupported,
  requestKeystoneDevice,
  getKeystoneDevices,
  getFirstKeystoneDevice,
  gracefullyResetDevice,
} from './webusb';
import { Buffer } from 'buffer';
import { Actions } from './actions';
import { generateApduPackets, parseApduPacket } from './frame';
export { Actions } from './actions';
export * from './webusb';

const configurationValue = 1;
const interfaceNumber = 1;
const packageSize = 64;

export default class TransportWebUSB {
  device: Nullable<USBDevice>;
  packetSize = 64;
  endpoint = 3;

  constructor(device: USBDevice) {
    this.device = device;
  }

  async send(command: Actions, data: string) {
    let result: Nullable<string> = null;
    if (!this.device?.opened) {
      this.device = await TransportWebUSB.request();
    }
    try {
      const packages = generateApduPackets(command, data);
      for (let i = 0; i < packages.length; i++) {
        const res = await this.device.transferOut(this.endpoint, packages[i]);
        if (res.status !== 'ok') throw new Error('response status not ok');
      }

      result = await this.receive();

    } catch (err) {
      console.error('send out error', err);
    }
    return result;
  }

  receive = async () => {
    if (!this.device?.opened) {
      return null;
    } 
    const packagesBuffer: Buffer[] = [];
    let counter = 0;
    let totalPackets = 0;
    let shouldContinue = true;
    do {
      const response = await this.device.transferIn(this.endpoint, packageSize);
      if (!response?.data?.buffer || response.data.buffer.byteLength === 0) {
        continue;
      };
      shouldContinue = false;
      const buffer = Buffer.from(response.data.buffer);
      packagesBuffer.push(buffer);
      totalPackets = buffer[2];
      counter += 1;
    } while (counter < totalPackets || shouldContinue);
    const data = packagesBuffer.map((buffer) => parseApduPacket(buffer)).sort(({ packetIndex: a }, { packetIndex: b }) => a - b).map(({ dataString }) => dataString).join('');
    return data;
  }

  static isSupported = isSupported;

  static list = getKeystoneDevices;

  static async request() {
    const device = await requestKeystoneDevice();
    return TransportWebUSB.open(device);
  }

  static async open(device: USBDevice) {
    await device.open();

    if (device.configuration === null) {
      await device.selectConfiguration(configurationValue);
    }

    await gracefullyResetDevice(device);

    try {
      await device.claimInterface(interfaceNumber);
    } catch (e: any) {
      await device.close();
    }

    const onDisconnect = e => {
      if (device === e.device) {
        navigator.usb.removeEventListener("disconnect", onDisconnect);
      }
    };

    navigator.usb.addEventListener("disconnect", onDisconnect);
    return device;
  }
}
