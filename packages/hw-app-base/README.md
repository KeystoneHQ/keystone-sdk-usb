# @keystonehq/hw-app-base

This npm package acts as an adapter for Keystone hardware wallets, designed to facilitate direct interactions through the UR protocol and ensure compatibility with existing keyring-based wallet integrations. The `Base` class primarily focuses on handling UR communications directly with Keystone hardware wallets, while other methods in this library support the `hardwarecall` protocol for device-specific operations.

## Features

The package offers several methods crucial for interfacing with hardware wallets and managing cryptographic keys and accounts:

### `pathToKeypath`

Converts a standard path to a keypath format recognized by Keystone hardware wallets.

### `parseResponseUR`

Parses a response in Uniform Resource (UR) format received from the hardware wallet.

### `buildCryptoAccount`

In wallets already integrated with Keystone via Keyring, connecting to the wallet typically requires calling Keyring's `syncKeyring(data: CryptoHDKey | CryptoAccount): void;` method. However, standard USB SDKs adhere to a universal USB integration approach, utilizing Keystone's HardwareCall to export accounts without providing CryptoHDKey and CryptoAccount directly. This can lead to difficulties when supporting USB in wallets that have already integrated with Keyring. Therefore, the `buildCryptoAccount` method is provided to convert results from HardwareCall into a CryptoAccount, ensuring compatibility with Keyring.

### `buildCryptoHDKey`

The `buildCryptoHDKey` function serves a similar purpose to `buildCryptoAccount`.

### `class Base`

In the latest version of Keyring, account exports can be accomplished through the `Base` class's `getURAccount` method, and UR input/output operations can be handled by `sendURRequest`. This approach does not require any data parsing, as specific tasks are still completed by Keyring.

## Note

This npm package is intended for use solely with wallets that have already integrated Keystone through the Keyring system. It serves as a compatibility solution and should not be used if Keyring has not been previously integrated. Using this library without prior Keyring integration may lead to unexpected behavior or compatibility issues.