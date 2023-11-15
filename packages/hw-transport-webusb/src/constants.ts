export const USBConfigurationValue = 1;
// pro
// export const USBInterfaceNumber = 0;
// dev
export const USBInterfaceNumber = 1;
export const USBPackageSize = 64;
// This constant represents the maximum number of USB packets. Each request packet can carry 55 valid data bytes,
// and each response packet can carry 53 valid data bytes. Therefore, the maximum data transfer volume for input is
// 200 * 55 bytes, and for the return is 200 * 53 bytes.
export const MAXUSBPackets = 200;
export const USBTimeout = 15000;
export const OFFSET_CLA = 0;
export const OFFSET_INS = 1;
export const OFFSET_P1 = 3;
export const OFFSET_P2 = 5;
export const OFFSET_LC = 7;
export const OFFSET_CDATA = 9;