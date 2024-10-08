# @keystonehq/hw-transport-usb

## Features
This package provides implementations for both WebUSB and NodeUSB drivers.and,this NPM package offers the `TransportWebUSB` class, which handles WebUSB functionality for Keystone hardware wallets. It also includes a
TransportNodeUSB class for using USB drivers in a Node.js environment.

### TransportUsbDriver Interface
This interface lays out some basic methods for USB drivers, like `send`, `receive`, `open`, and `close`. Both `TransportWebUSB` and `TransportNodeUSB` implement this interface, so they've got all these methods covered.

### TransportWebUSB 和 TransportNodeUSB Class

The `TransportWebUSB` class takes a USB device and an optional configuration object during initialization. 
The `TransportNodeUSB` class is implemented based on the nodeusb library(https://github.com/node-usb/node-usb).

Both of these classes maintain the same API interface, so it's easy to switch between them.

The class offers two key static methods:

#### `requestPermission`

This asynchronous method requests user permission to access a USB device. It first verifies if the WebUSB API is supported in the current environment, then requests access to a USB device. After the device access permission is granted, it ensures the device is properly closed.

#### `connect`

This asynchronous method connects to a USB device. It checks for WebUSB API support in the current environment and retrieves a list of all USB devices that the application has permission to access. If multiple devices are available, the method prompts the user to select one. It then creates and returns a new `TransportWebUSB` instance using the selected device and the provided configuration.

### TransportConfig

The `TransportConfig` object is an optional parameter during the initialization of the `TransportWebUSB` class. It enables developers to customize various settings related to the transport operation:

- `endpoint`: (Optional) Specifies the endpoint for the USB communication.
- `timeout`: (Optional) Determines the maximum duration (in milliseconds) that the transport operation should wait before timing out.
- `maxPacketSize`: (Optional) Defines the maximum packet size that the transport operation can handle.
- `disconnectListener`: (Optional) A function that is invoked when the USB device is disconnected. This function should accept a `USBDevice` object as an argument, representing the device that has been disconnected.

## Additional Documentation

For more information, you can refer to the following documents:

- [Transport Result Status Codes](../../docs/Status_Codes.md)
- [EAPDU Protocol Documentation](../../docs/EAPDU_Readme.md)