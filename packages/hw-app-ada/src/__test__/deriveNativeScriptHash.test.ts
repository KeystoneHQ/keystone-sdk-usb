import type { NativeScript } from '../index';
import {
  InvalidData,
  InvalidDataReason,
  NativeScriptHashDisplayFormat,
  NativeScriptType,
} from '../index';
import Ada from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { str_to_path } from '../utils/address';
type ValidNativeScriptTestCase = {
  testName: string;
  script: NativeScript;
  displayFormat: NativeScriptHashDisplayFormat;
  hashHex: string;
};

export const ValidNativeScriptTestCases: ValidNativeScriptTestCase[] = [
  {
    testName: 'PUBKEY - device owned',
    script: {
      type: NativeScriptType.PUBKEY_DEVICE_OWNED,
      params: {
        path: str_to_path("1852'/1815'/0'/0/0"),
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '5102a193b3d5f0c256fcc425836ffb15e7d96d3389f5e57dc6bea726',
  },
  {
    testName: 'PUBKEY - third party',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '855228f5ecececf9c85618007cc3c2e5bdf5e6d41ef8d6fa793fe0eb',
  },
  {
    testName: 'PUBKEY - third party (script hash displayed as policy id)',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.POLICY_ID,
    hashHex: '855228f5ecececf9c85618007cc3c2e5bdf5e6d41ef8d6fa793fe0eb',
  },
  {
    testName: 'ALL script',
    script: {
      type: NativeScriptType.ALL,
      params: {
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
            },
          },
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'af5c2ce476a6ede1c879f7b1909d6a0b96cb2081391712d4a355cef6',
  },
  {
    testName: 'ALL script (no subscripts)',
    script: {
      type: NativeScriptType.ALL,
      params: {
        scripts: [],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'd441227553a0f1a965fee7d60a0f724b368dd1bddbc208730fccebcf',
  },
  {
    testName: 'ANY script',
    script: {
      type: NativeScriptType.ANY,
      params: {
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
            },
          },
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'd6428ec36719146b7b5fb3a2d5322ce702d32762b8c7eeeb797a20db',
  },
  {
    testName: 'ANY script (no subscripts)',
    script: {
      type: NativeScriptType.ANY,
      params: {
        scripts: [],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '52dc3d43b6d2465e96109ce75ab61abe5e9c1d8a3c9ce6ff8a3af528',
  },
  {
    testName: 'N_OF_K script',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: 2,
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
            },
          },
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '78963f8baf8e6c99ed03e59763b24cf560bf12934ec3793eba83377b',
  },
  {
    testName: 'N_OF_K script (no subscripts)',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: 0,
        scripts: [],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '3530cc9ae7f2895111a99b7a02184dd7c0cea7424f1632d73951b1d7',
  },
  {
    testName: 'INVALID_BEFORE script',
    script: {
      type: NativeScriptType.INVALID_BEFORE,
      params: {
        slot: 42,
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '2a25e608a683057e32ea38b50ce8875d5b34496b393da8d25d314c4e',
  },
  {
    testName: 'INVALID_BEFORE script (slot is a big number)',
    script: {
      type: NativeScriptType.INVALID_BEFORE,
      params: {
        slot: '18446744073709551615',
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'd2469adac494849dd27d1b344b74cc6cd5bf31fbd01c879eae84c04b',
  },
  {
    testName: 'INVALID_HEREAFTER script',
    script: {
      type: NativeScriptType.INVALID_HEREAFTER,
      params: {
        slot: 42,
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '1620dc65993296335183f23ff2f7747268168fabbeecbf24c8a20194',
  },
  {
    testName: 'INVALID_HEREAFTER script (slot is a big number)',
    script: {
      type: NativeScriptType.INVALID_HEREAFTER,
      params: {
        slot: '18446744073709551615',
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'da60fa40290f93b889a88750eb141fd2275e67a1255efb9bac251005',
  },
  {
    testName: 'Nested native scripts',
    script: {
      type: NativeScriptType.ALL,
      params: {
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
            },
          },
          {
            type: NativeScriptType.ANY,
            params: {
              scripts: [
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
                  },
                },
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
                  },
                },
              ],
            },
          },
          {
            type: NativeScriptType.N_OF_K,
            params: {
              requiredCount: 2,
              scripts: [
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
                  },
                },
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
                  },
                },
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      'cecb1d427c4ae436d28cc0f8ae9bb37501a5b77bcc64cd1693e9ae20',
                  },
                },
              ],
            },
          },
          {
            type: NativeScriptType.INVALID_BEFORE,
            params: {
              slot: 100,
            },
          },
          {
            type: NativeScriptType.INVALID_HEREAFTER,
            params: {
              slot: 200,
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '0d63e8d2c5a00cbcffbdf9112487c443466e1ea7d8c834df5ac5c425',
  },
  {
    testName: 'Nested native scripts #2',
    script: {
      type: NativeScriptType.ALL,
      params: {
        scripts: [
          {
            type: NativeScriptType.ANY,
            params: {
              scripts: [
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      'c4b9265645fde9536c0795adbcc5291767a0c61fd62448341d7e0386',
                  },
                },
                {
                  type: NativeScriptType.PUBKEY_THIRD_PARTY,
                  params: {
                    keyHashHex:
                      '0241f2d196f52a92fbd2183d03b370c30b6960cfdeae364ffabac889',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: '903e52ef2421abb11562329130330763583bb87cd98006b70ecb1b1c',
  },
  {
    testName: 'Nested native scripts #3',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: 0,
        scripts: [
          {
            type: NativeScriptType.ALL,
            params: {
              scripts: [
                {
                  type: NativeScriptType.ANY,
                  params: {
                    scripts: [
                      {
                        type: NativeScriptType.N_OF_K,
                        params: {
                          requiredCount: 0,
                          scripts: [],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    displayFormat: NativeScriptHashDisplayFormat.BECH32,
    hashHex: 'ed1dd7ef95caf389669c62618eb7f7aa7eadd08feb76618db2ae0cfc',
  },
];

type InvalidOnLedgerScriptTestCase = {
  testName: string;
  script: NativeScript;
};

export const InvalidOnLedgerScriptTestCases: InvalidOnLedgerScriptTestCase[] = [
  {
    testName: 'PUBKEY - invalid key path',
    script: {
      type: NativeScriptType.PUBKEY_DEVICE_OWNED,
      params: {
        path: [0, 0, 0, 0, 0, 0],
      },
    },
  },
  {
    testName: 'PUBKEY - invalid key hash (too short)',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa',
      },
    },
  },
  {
    testName: 'PUBKEY - invalid key hash (not hex)',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3g55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
      },
    },
  },
  {
    testName: 'N_OF_K - invalid required count (higher than number of scripts)',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: 1,
        scripts: [],
      },
    },
  },
];

type InvalidScriptTestCase = {
  testName: string;
  script: NativeScript;
  invalidDataReason: InvalidDataReason;
};

export const InvalidScriptTestCases: InvalidScriptTestCase[] = [
  {
    testName: 'PUBKEY - invalid key path',
    script: {
      type: NativeScriptType.PUBKEY_DEVICE_OWNED,
      params: {
        path: [0, 0, 0, 0, 0, 0],
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_PATH,
  },
  {
    testName: 'PUBKEY - invalid key hash (too short)',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa',
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH,
  },
  {
    testName: 'PUBKEY - invalid key hash (not hex)',
    script: {
      type: NativeScriptType.PUBKEY_THIRD_PARTY,
      params: {
        keyHashHex: '3g55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_KEY_HASH,
  },
  {
    testName: 'N_OF_K - invalid required count (negative number)',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: -1,
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
            },
          },
        ],
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_REQUIRED_COUNT,
  },
  {
    testName: 'N_OF_K - invalid required count (higher than number of scripts)',
    script: {
      type: NativeScriptType.N_OF_K,
      params: {
        requiredCount: 1,
        scripts: [],
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_REQUIRED_COUNT_HIGHER_THAN_NUMBER_OF_SCRIPTS,
  },
  {
    testName:
      'INVALID_BEFORE - invalid invalidBefore (negative number) as a subscript',
    script: {
      type: NativeScriptType.ANY,
      params: {
        scripts: [
          {
            type: NativeScriptType.PUBKEY_THIRD_PARTY,
            params: {
              keyHashHex:
                '3a55d9f68255dfbefa1efd711f82d005fae1be2e145d616c90cf0fa9',
            },
          },
          {
            type: NativeScriptType.INVALID_BEFORE,
            params: {
              slot: -1,
            },
          },
        ],
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT,
  },
  {
    testName: 'INVALID_HEREAFTER - invalid invalidHereafter (negative number)',
    script: {
      type: NativeScriptType.INVALID_HEREAFTER,
      params: {
        slot: -1,
      },
    },
    invalidDataReason:
      InvalidDataReason.DERIVE_NATIVE_SCRIPT_HASH_INVALID_TOKEN_LOCKING_SLOT,
  },
];

jest.setTimeout(100000);
describe('Keystone getExtendedPublicKeys', () => {
  let app: Ada;

  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      })
    );
    // init device
    await app.initAda();
    // sleep 10000
    await new Promise((resolve) => setTimeout(resolve, 10000));
  });

  describe('Valid native scripts', () => {
    for (const {
      testName,
      script,
      displayFormat,
      hashHex: expectedHash,
    } of ValidNativeScriptTestCases) {
      it(testName, async () => {
        const promise = app.deriveNativeScriptHash({
          script,
          displayFormat,
        });
        expect((await promise).scriptHashHex).toEqual(expectedHash);
      });
    }
  });

  describe('Keystone should not permit invalid scripts', () => {
    for (const { testName, script } of InvalidOnLedgerScriptTestCases) {
      it(testName, async () => {
        const promise = app.deriveNativeScriptHash({
          script,
          displayFormat: NativeScriptHashDisplayFormat.BECH32,
        });
        await expect(promise).rejects.toThrow(InvalidData);
      });
    }
  });

  describe('Keystone should not permit invalid scripts', () => {
    for (const { testName, script } of InvalidOnLedgerScriptTestCases) {
      it(testName, async () => {
        const promise = app.deriveNativeScriptHash({
          script,
          displayFormat: NativeScriptHashDisplayFormat.BECH32,
        });
        await expect(promise).rejects.toThrow(InvalidData);
      });
    }
  });

  describe('Ledgerjs should not permit invalid scripts', () => {
    for (const {
      testName,
      script,
      invalidDataReason: expectedInvalidDataReason,
    } of InvalidScriptTestCases) {
      it(testName, async () => {
        const promise = app.deriveNativeScriptHash({
          script,
          displayFormat: NativeScriptHashDisplayFormat.BECH32,
        });
        await expect(promise).rejects.toThrow(InvalidData);
      });
    }
  });
});
