import Ada, {
  CertificateType,
  Networks,
  PoolKeyType,
  PoolOwnerType,
  PoolRewardAccountType,
  TransactionSigningMode,
  TxOutputDestinationType,
} from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';

jest.setTimeout(100000);

describe('Keystone sign pool  transaction', () => {
  let app: Ada;

  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      })
    );
    await app.initAda();
    // sleep 10s
    await new Promise((resolve) => setTimeout(resolve, 10000));
  });

  describe('Should successfully sign pool registration transaction', () => {
    it('Should successfully sign ordinary certificate pool retirement', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          inputs: [
            {
              path: null,
              txHashHex:
                '1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc',
              outputIndex: 0,
            },
          ],
          outputs: [
            {
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex:
                    '82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c2561',
                },
              },
              amount: 3003112,
            },
          ],
          fee: 42,
          ttl: 10,
          certificates: [
            {
              type: CertificateType.STAKE_POOL_RETIREMENT,
              params: {
                poolKeyPath: [2147485501, 2147485463, 2147483648, 2147483648],
                retirementEpoch: '109',
              },
            },
          ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [
          [2147485500, 2147485463, 2147483648, 0, 0],
          [2147485501, 2147485463, 2147483648, 2147483648],
        ],
      });

      const witness = response?.witnesses;
      console.log('witness', witness);

      expect(witness).toBeDefined();
      expect(witness?.length).toBe(2);

      witness?.forEach((w) => {
        expect(w.path).toBeDefined();
        expect(w.witnessSignatureHex).toBeDefined();
        expect(typeof w.witnessSignatureHex).toBe('string');
      });
    });

    it('Should successfully sign pool registration as owner without relays', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          inputs: [
            {
              path: null,
              txHashHex:
                '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
              outputIndex: 0,
            },
          ],
          outputs: [
            {
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex:
                    '017cb05fce110fb999f01abb4f62bc455e217d4a51fde909fa9aea545443ac53c046cf6a42095e3c60310fa802771d0672f8fe2d1861138b09',
                },
              },
              amount: 1,
            },
          ],
          fee: 42,
          ttl: 10,
          certificates: [
            {
              type: CertificateType.STAKE_POOL_REGISTRATION,
              params: {
                poolKey: {
                  type: PoolKeyType.THIRD_PARTY,
                  params: {
                    keyHashHex:
                      '13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad',
                  },
                },
                vrfKeyHashHex:
                  '07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450',
                pledge: '50000000000',
                cost: '340000000',
                margin: {
                  numerator: '3',
                  denominator: '100',
                },
                rewardAccount: {
                  type: PoolRewardAccountType.THIRD_PARTY,
                  params: {
                    rewardAccountHex:
                      'e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
                  },
                },
                poolOwners: [
                  {
                    type: PoolOwnerType.DEVICE_OWNED,
                    params: {
                      stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
                    },
                  },
                  {
                    type: PoolOwnerType.THIRD_PARTY,
                    params: {
                      stakingKeyHashHex:
                        '794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
                    },
                  },
                ],
                relays: [],
                metadata: null,
              },
            },
          ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [[2147485500, 2147485463, 2147483648, 2, 0]],
      });

      const witness = response?.witnesses;
      console.log('witness', witness);

      expect(witness).toBeDefined();
      expect(witness?.length).toBe(1);

      witness?.forEach((w) => {
        expect(w.path).toBeDefined();
        expect(w.witnessSignatureHex).toBeDefined();
        expect(typeof w.witnessSignatureHex).toBe('string');
      });
    });

    it('Should successfully sign pool registration as owner with multi assets', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          inputs: [
            {
              path: null,
              txHashHex:
                'a2218c7738c374fa68fed428bf28447f550c3c33cb92a5bd06e2b62f37779539',
              outputIndex: 0,
            },
            {
              path: null,
              txHashHex:
                'ade4616f96066ab24f49dcd4adbcae9ae83750d34e4620a49d737d4a66835d64',
              outputIndex: 0,
            },
          ],
          outputs: [
            {
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex:
                    '01bf63a166d9c10d85e4fd3401de03907e232e7707218c3bfd5a570d7acab53e9efebb49bafb4e74d675c2d682dd8e402f15885fb6d1bc0023',
                },
              },
              amount: 9810000,
              tokenBundle: [
                {
                  policyIdHex:
                    '0b1bda00e69de8d554eeafe22b04541fbb2ff89a61d12049f55ba688',
                  tokens: [
                    {
                      assetNameHex: '66697273746173736574',
                      amount: '4',
                    },
                  ],
                },
                {
                  policyIdHex:
                    '95a292ffee938be03e9bae5657982a74e9014eb4960108c9e23a5b39',
                  tokens: [
                    {
                      assetNameHex: '66697273746173736574',
                      amount: '4',
                    },
                    {
                      assetNameHex: '7365636f6e646173736574',
                      amount: '4',
                    },
                  ],
                },
              ],
            },
            {
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex:
                    '0114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
              },
              amount: 3491695,
            },
          ],
          fee: 190000,
          ttl: 9960000,
          certificates: [
            {
              type: CertificateType.STAKE_POOL_REGISTRATION,
              params: {
                poolKey: {
                  type: PoolKeyType.THIRD_PARTY,
                  params: {
                    keyHashHex:
                      '13381d918ec0283ceeff60f7f4fc21e1540e053ccf8a77307a7a32ad',
                  },
                },
                vrfKeyHashHex:
                  '07821cd344d7fd7e3ae5f2ed863218cb979ff1d59e50c4276bdc479b0d084450',
                pledge: '50000000000',
                cost: '340000000',
                margin: {
                  numerator: '3',
                  denominator: '100',
                },
                rewardAccount: {
                  type: PoolRewardAccountType.THIRD_PARTY,
                  params: {
                    rewardAccountHex:
                      'e1794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
                  },
                },
                poolOwners: [
                  {
                    type: PoolOwnerType.DEVICE_OWNED,
                    params: {
                      stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
                    },
                  },
                  {
                    type: PoolOwnerType.THIRD_PARTY,
                    params: {
                      stakingKeyHashHex:
                        '794d9b3408c9fb67b950a48a0690f070f117e9978f7fc1d120fc58ad',
                    },
                  },
                ],
                relays: [],
                metadata: null,
              },
            },
          ],
        },
        signingMode: TransactionSigningMode.POOL_REGISTRATION_AS_OWNER,
        additionalWitnessPaths: [[2147485500, 2147485463, 2147483648, 2, 0]],
      });

      const witness = response?.witnesses;
      console.log('witness', witness);

      expect(witness).toBeDefined();
      expect(witness?.length).toBe(1);

      witness?.forEach((w) => {
        expect(w.path).toBeDefined();
        expect(w.witnessSignatureHex).toBeDefined();
        expect(typeof w.witnessSignatureHex).toBe('string');
      });
    });
  });
});
