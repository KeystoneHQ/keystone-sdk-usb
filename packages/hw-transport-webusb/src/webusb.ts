import { USBInterfaceNumber, USBConfigurationValue } from './constants';
import { isEmpty } from './helper';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';
import { Buffer } from 'buffer';

export const keystoneUSBVendorId = 4617;

const keystoneDevices = [
  {
    vendorId: keystoneUSBVendorId,
  },
];

export const initializeDisconnectListener = (
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

async function selectDefaultConfiguration(device: USBDevice): Promise<void> {
  if (device.configuration === null) {
    await device.selectConfiguration(USBConfigurationValue);
  }
}

export async function requestKeystoneDevice(): Promise<USBDevice> {
  const device = await navigator.usb.requestDevice({
    filters: keystoneDevices,
  });
  return device;
}

export const open = async (device: USBDevice): Promise<USBDevice> => {
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

export async function getKeystoneDevices(): Promise<USBDevice[]> {
  const devices = await navigator.usb.getDevices();
  return devices.filter((d: USBDevice) => d.vendorId === keystoneUSBVendorId);
}

export async function getFirstKeystoneDevice(): Promise<USBDevice> {
  const existingDevices = await getKeystoneDevices();
  if (existingDevices.length > 0) return existingDevices[0];
  return requestKeystoneDevice();
}

export const isSupported = async (): Promise<boolean> => {
  if (!navigator?.usb || typeof navigator.usb.getDevices !== 'function') throwTransportError(Status.ERR_NOT_SUPPORTED);
  if (isEmpty(await getKeystoneDevices())) throwTransportError(Status.ERR_DEVICE_NOT_FOUND);
  return true;
};

export async function gracefullyResetDevice(device: USBDevice): Promise<void> {
  try {
    await device.reset();
  } catch (err) {
    console.warn(err);
  }
}

export const request = async (): Promise<USBDevice> => {
  const device = await requestKeystoneDevice();
  return await open(device);
};

export const close = async (device: USBDevice): Promise<void> => {
  try {
    console.log('Closing device');
    await device.releaseInterface(USBInterfaceNumber);
    await gracefullyResetDevice(device);
    await device.close();
    console.log('Closing device done');
  } catch (err) {
    console.log('in closh func');
    console.warn(err);
  }
};
