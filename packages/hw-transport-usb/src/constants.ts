export const USBConfigurationValue = 1;
// use 0 for production firmware
// use 1 for development firmware since the 0 interface number will be used by MSC for development
export const USBInterfaceNumber = process.env.KEYSTONE_USB_ENV === 'development' ? 0 : 0;
export const USBPackageSize = 64;
export const MAXUSBPackets = 200;
// 15s to set the usb timeout since it may need users' action on the device.
export const USBTimeout = 1000 * 15;
export const OFFSET_CLA = 0;
export const OFFSET_INS = 1;
export const OFFSET_P1 = 3;
export const OFFSET_P2 = 5;
export const OFFSET_LC = 7;
export const OFFSET_CDATA = 9;

// keystone 3 pro coldwallet device identifier
export const keystoneUSBVendorId = 4617;
export const keystoneUSBProductId = 12289;