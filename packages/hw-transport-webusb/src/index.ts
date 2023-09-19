import {
  isSupported,
  requestKeystoneDevice,
  getKeystoneDevices,
  getFirstKeystoneDevice,
  gracefullyResetDevice,
} from './webusb';

const configurationValue = 1;
const endpointNumber = 3;
const interfaceNumber = 1;

export default class TransportWebUSB {
  device: Nullable<USBDevice>;
  packetSize = 64;

  constructor(device: USBDevice) {
    this.device = device;
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
    return null;
  }
}
