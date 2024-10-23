# QR and USB 

_This document serves as a comprehensive guide for software wallets that have already integrated with Keystone via QR Codes and are now looking to add USB support. It assumes that readers have a basic understanding of Keystone, QR Codes, and UR encoding. If you are unfamiliar with these concepts, please refer to the [integration guide](https://dev.keyst.one). 
_**If you are new and seeking USB integration with Keystone, please check the [README file](https://github.com/KeystoneHQ/keystone-sdk-usb) in this repository for more information.**_


Initially, Keystone 3 only supported QR Code as the data transmission method, known as air-gapped mode, to ensure the hardware device remained completely offline. However, as the user base grew, many users requested USB signing. Some users lacked cameras to scan QR Codes, while others believed USB signing would offer a more user-friendly experience in terms of UI/UX. In response, Keystone 3 now supports USB signing. Currently, Keystone 3 has added support for Ethereum, Solana, Bitcoin, and Cosmos, with more blockchain support coming soon.

## USB Data Protocol
For USB data transmission, we also utilize the Uniform Resource (UR) encoding format. This approach ensures consistency with the existing QR Code data transmission method, allowing us to leverage advanced features such as transaction decoding. Additionally, this consistency simplifies the process for software that has already integrated QR Code support to adopt USB functionality seamlessly.

## Add USB Support for exisiting QR intergration

Many software wallets have already integrated with Keystone using QR Codes. If you would like to introduce USB support, the process is straightforward. Initially, the software wallet generates the UR code and encodes it into a QR Code. With USB, the UR data is transmitted using the `hw-app-base` library, which then returns the UR data to the software wallet. Since the integration via QR Code already exists, the subsequent UR processing remains the same.

Here is an working example about how to introduce the USB in the exisitng QR Code intergration. 

### Install required packages

These two packaegs are required for adding USB support.

- `@keystonehq/hw-app-base`
- `@keystonehq/hw-transport-webusb`

### Retrieve Addresses/Public Keys from Keystone
In the QR Code integration, Keystone exposes addresses or public keys via QR Codes, and the software wallet opens the camera to scan the QR codes to obtain the related data. With USB, the process is slightly different. The software wallet must decide which public keys or extended public keys to retrieve from Keystone.

Here is an example of how to achieve this:

```js
...// existiing fetching keys/connecting keystone file

// add these two usb package
import { TransportWebUSB } from "@keystonehq/hw-transport-webusb";
import Base from "@keystonehq/hw-app-base";

import KeystoneSDK, { Curve, DerivationAlgorithm } from "@keystonehq/keystone-sdk";

// Required public keys by derivation path from Keystone
const REQUIRED_KEYSTONE_PATHS = [
  "m/44'/118'/0'/0/0",  // cosmos path
  "m/44'/60'/0'/0/0",   // ethereum path
];

const transport = await createKeystoneTransport();
const baseApp = new Base(transport);

for (const path of paths) {
    const res = await baseApp.getURAccount(
      path,
      Curve.secp256k1,
      DerivationAlgorithm.slip10
    );
    
    // The KeystoneSDK should exist since the QR integration 
    // just use the parseMultiAccounts to get the public keys
    const sdk = new KeystoneSDK({
      origin: "Keplr Extension",
    });
    const account = sdk.parseMultiAccounts(res.toUR());
    keys.push(account.keys[0]);
    device = account.device;
    deviceId = account.deviceId;
    masterFingerprint = account.masterFingerprint;
  }

... //exisiting keys saving logic
```

### Signing data or transaction.

With USB signing, the process becomes significantly more straightforward. The data encoding logic remains the same as with QR Codes. You simply need to encode the URdata into String and use the `sendURRequest` function to transmit the data to Keystone via USB. The return value of this method is also in UR format, allowing you to maintain the same logic as the existing QR Code integration.

Below is an example demonstrating how to support signing with both QR and USB methods seamlessly.

```js

...// exisitng Keystone signing file

// add these two usb package
import { TransportWebUSB } from "@keystonehq/hw-transport-webusb";
import Base from "@keystonehq/hw-app-base";

let ur: UR = someUR; // existing UR generating logic 
// Keystone usb signing
let urResult: KeystoneUR;
if (isUSB) {
    try {
        // the new added USB code
        const transport = await createKeystoneTransport();
        //use UREncoder to encode the existing UR to URString, please use Infinity as size  
        const URString = new UREncoder(ur, Infinity).nextPart().toUpperCase();
        const baseApp = new Base(transport as any);

        // send the URString to keystone via USB and get the UR response
        const response: UR = await baseApp.sendURRequest(URString);
        // share the same UR processing logic with QRCodes.
        urResult = {
            type: response.type,
            cbor: response.cbor.toString("hex"),
          } as KeystoneUR;
        } catch (e) {
          throw new KeplrError(
            ErrModuleKeystoneSign,
            ErrKeystoneUSBCommunication,
            handleKeystoneUSBError(e)
          );
        }
    } else {

        // existing QR integration logic 
        await keystoneOptions.displayQRCode({
          type: ur.type,
          cbor: ur.cbor.toString("hex"),
    });
    urResult = await keystoneOptions.scanQRCode();
}

...// follow the same URReuslt process logic. 

```

### Reference
- [Keplr PR](https://github.com/chainapsis/keplr-wallet/pull/1209/) for adding USB support with exisiting QR code integration in Keplr Wallet. 


That's it, Adding the USB support with existing QR Code support is really easy and straightforward.:)

Note: **If you are new and seeking USB integration with Keystone, please check the [README file](https://github.com/KeystoneHQ/keystone-sdk-usb) in this repository for more information.**.