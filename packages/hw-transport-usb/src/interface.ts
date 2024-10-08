import { Actions } from './actions';


// This interface defines the specification for HID transport. Currently, we provide a USB-based HID transport implementation.
// In the future, we may provide HID transport implementations based on BLUETOOTH or NFC.
export interface TransportHID {
    send<T>(action: Actions, data: unknown): Promise<T>;
    receive(action: Actions, requestID: number): Promise<any>;
    open(): Promise<void>;
    close(): Promise<void>;
}
