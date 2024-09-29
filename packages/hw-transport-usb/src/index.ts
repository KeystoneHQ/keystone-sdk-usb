import { Actions } from './actions';
import { USBInterfaceNumber } from './constants';
export { Actions } from './actions';
export { Status as StatusCode } from '@keystonehq/hw-transport-error';
export { Chain } from './chain';
export * from './decorators';
export * from './helper';
export * from './frame';
export * from './constants';

export interface TransportConfig {
  endpoint?: number;
  timeout?: number;
  maxPacketSize?: number;
  disconnectListener?: (device: USBDevice) => void;
}
export interface TransportUsbDriver {
    send<T>(action: Actions, data: unknown): Promise<T>;
    receive(action: Actions, requestID: number): Promise<any>;
    open(): Promise<void>;
    close(): Promise<void>;
  }


async function clearUSBState(device) {
  console.log('Received error, resetting device...');
  try {
    if (device && device.opened) {
      // Release all interfaces
      if (device.configuration) {
        await device.releaseInterface(USBInterfaceNumber);
      }
      // Close the device connection
      // await device.close();
    }
  } catch (error) {
    console.error('Error during USB state cleanup:', error);
  } finally {
    // Reset application state
    // device = null; // if reconnection is required, device can be set to null
    console.log('reset action done');
  }
}