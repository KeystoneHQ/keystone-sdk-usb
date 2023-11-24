# @keystonehq/hw-app-eth

This NPM package provides the `Eth` class, which extends the functionality of Keystone hardware wallets for Ethereum operations.

## Features

The `Eth` class offers several key methods to handle Ethereum transactions and account operations, including:

#### `createWithUSBTransport`

This static asynchronous method creates an `Eth` instance using a `TransportWebUSB` instance. It connects to the USB device, closes the connection, and then returns a new `Eth` instance.

#### `checkLockStatus`

This asynchronous method checks the lock status of the wallet.

#### `signTransaction`

This asynchronous method signs a provided Ethereum transaction. It first determines the type of the transaction, then generates a message to sign. The method encodes the transaction into a UR and sends it to the hardware wallet for signing. The signed transaction is then returned.

#### `signTransactionFromUr`

This asynchronous method takes a `urString` as input, sends it to the hardware wallet and returns the response.

#### `exportPubKeyFromUr`

This asynchronous method sends a request to the hardware wallet to export a public key or account from a UR. The method decodes the response UR and returns a `CryptoHDKey` or `CryptoAccount` instance.

## Usage

```javascript
import Eth from '@keystonehq/hw-app-eth';

async function example() {
  const eth = await Eth.createWithUSBTransport();

  // Check lock status
  const lockStatus = await eth.checkLockStatus();
  console.log(lockStatus);

  // Sign transaction
  // ... setup keyringInstance, address, tx
  const signedTx = await eth.signTransaction(keyringInstance, address, tx);
  console.log(signedTx);
}

example();
```