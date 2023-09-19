const keystoneUSBVendorId = 4617;

const keystoneDevices = [
  {
    vendorId: keystoneUSBVendorId,
  },
];

export async function requestKeystoneDevice(): Promise<USBDevice> {
  const device = await navigator.usb.requestDevice({
    filters: keystoneDevices,
  });
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
  Promise.resolve(!!navigator && !!navigator.usb && typeof navigator.usb.getDevices === "function");

export async function gracefullyResetDevice(device: USBDevice) {
  try {
    await device.reset();
  } catch (err) {
    console.warn(err);
  }
}