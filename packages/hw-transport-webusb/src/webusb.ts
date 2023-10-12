import { USBInterfaceNumber, USBConfigurationValue } from './constants';
import { Buffer } from 'buffer';

const keystoneUSBVendorId = 4617;

const keystoneDevices = [
  {
    vendorId: keystoneUSBVendorId,
  },
];

async function requestKeystoneDevice(): Promise<USBDevice> {
  const device = await navigator.usb.requestDevice({
    filters: keystoneDevices,
  });
  return device;
}

const open = async (device: USBDevice) => {
  await device.open();

  if (device.configuration === null) {
    await device.selectConfiguration(USBConfigurationValue);
  }

  await gracefullyResetDevice(device);

  try {
    await device.claimInterface(USBInterfaceNumber);
  } catch (e: any) {
    await device.close();
  }

  const onDisconnect = e => {
    if (device === e.device) {
      navigator.usb.removeEventListener('disconnect', onDisconnect);
    }
  };

  navigator.usb.addEventListener('disconnect', onDisconnect);
  return device;
}

export async function getKeystoneDevices(): Promise<USBDevice[]> {
  const devices = await navigator.usb.getDevices();
  return devices.filter(d => d.vendorId === keystoneUSBVendorId);
}

export async function getFirstKeystoneDevice(): Promise<USBDevice> {
  const existingDevices = await getKeystoneDevices();
  if (existingDevices.length > 0) return existingDevices[0];
  return requestKeystoneDevice();
}

export const isSupported = (): Promise<boolean> =>
  Promise.resolve(!!navigator && !!navigator.usb && typeof navigator.usb.getDevices === 'function');

export async function gracefullyResetDevice(device: USBDevice) {
  try {
    await device.reset();
  } catch (err) {
    console.warn(err);
  }
}

export const request = async () => {
  const device = await requestKeystoneDevice();
  return open(device);
}
