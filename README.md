# Keystone-SDK-USB

**Keystone-SDK-USB** is a robust and versatile SDK package designed to provide seamless USB support for Keystone devices. It features an intuitive API, allowing third-party wallets and decentralized applications (dApps) to effortlessly connect with Keystone devices via USB connections.

## Packages

All packages are organized by blockchain. If you are looking for support for a specific blockchain, you can select the desired package from the following list:

- `hw-app-base`: The foundational library that extracts common methods for other packages.
- `hw-app-cosmos`: The Cosmos chain package for supporting Cosmos-related blockchains.
- `hw-app-eth`: The Ethereum/EVM chain package for supporting Ethereum-related blockchains.
- `hw-app-sol`: The Solana chain package for supporting Solana blockchains.
- `hw-transport-webusb`: The transport package for USB connection and communication.
- `hw-transport-error`: The package for handling USB transport errors during communications.

## API Design

The API design for these packages follows the `ledger` API style. If your application already supports Ledger devices, integrating support for Keystone devices will be straightforward and seamless.

## Example

Below is a straightforward example demonstrating how to sign an Ethereum transaction using the USB SDK. For instructions on other blockchains, please refer to the README file of the respective package.

```js

import { TransportWebUSB, getKeystoneDevices } from '@keystonehq/hw-transport-webusb';
import { Eth } from '@keystonehq/hw-app-eth';

// ask browser permission for connecting keystone device
if ((await getKeystoneDevices()).length <= 0) {
    console.log('no device')
    await TransportWebUSB.requestPermission();
}

// create the transprot instance for usb connection
const transport = await TransportWebUSB.connect({ timeout: 100000 });

// create the specific app by chain
const ethApp = new Eth(transport)

// get the ethereum address by derivation path
// the api is same as ledger js sdk 
// https://github.com/LedgerHQ/ledger-live/tree/develop/libs/ledgerjs/packages/hw-app-eth#getaddress
const address = eth.getAddress("44'/60'/0'/0/0").then(o => o.address)

// sign an ethereum transaction 
// the api is same as the ledger js sdk
// https://github.com/LedgerHQ/ledger-live/tree/develop/libs/ledgerjs/packages/hw-app-eth#signtransaction
const tx = "e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080"; // raw tx to sign
const signature = ethApp.signTransaction(tx);
console.log(result);
```

**Since the Keystone device supports multiple seed phrases, the master fingerprint (mfp) is used as the identifier for each. The mfp will be returned when calling `getAddress`. Please save the mfp for future use.**

```js
const transport = await TransportWebUSB.connect({ timeout: 100000 });

// connect
const ethApp = new Eth(transport)
const {address, mfp} = await eth.getAddress("44'/60'/0'/0/0");


// sign
const ethApp = new Eth(transport, mfp)
// will throw error if the mfp is missing.
const signature = await eth.signTransaction(tx);

```

## Development

### Install
```
pnpm install
```

### Build
```
 pnpm build
```

### Example and dev env

```
pnpm run dev
```