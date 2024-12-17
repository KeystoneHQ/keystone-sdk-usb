import Ada, {
  CertificateType,
  CredentialParamsType,
  Networks,
  TransactionSigningMode,
  TxOutputDestinationType,
} from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';

jest.setTimeout(100000);

describe('Keystone sign transaction', () => {
  let app: Ada;

  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      })
    );
    await app.initAda();
    await new Promise((resolve) => setTimeout(resolve, 10000));
  });

  describe('Should successfully sign shelley transaction', () => {
    it('Should successfully sign transaction with stake delegation', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          inputs: [
            {
              path: null,
              txHashHex:
                '71b1f4d93070d035b27ce482784617238f75342d7d2da77a97828c9f561bff38',
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
                    '0114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
              },
              amount: 2648618,
            },
          ],
          fee: 190000,
          ttl: 11286882,
          certificates: [
            {
              type: CertificateType.STAKE_DELEGATION,
              params: {
                poolKeyHashHex:
                  '04c60c78417132a195cbb74975346462410f72612952a7c4ade7e438',
                stakeCredential: {
                  type: CredentialParamsType.KEY_PATH,
                  keyPath: [2147485500, 2147485463, 2147483648, 2, 0],
                },
              },
            },
          ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [
          [2147485500, 2147485463, 2147483648, 0, 0],
          [2147485500, 2147485463, 2147483648, 2, 0],
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

    it('Should successfully sign transaction with withdrawals', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          inputs: [
            {
              path: null,
              txHashHex:
                'bc8bf52ea894fb8e442fe3eea628be87d0c9a37baef185b70eb00a5c8a849d3b',
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
                    '0114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
              },
              amount: 3218618,
            },
          ],
          fee: 181297,
          ttl: 11284657,
          withdrawals: [
            {
              stakeCredential: {
                type: 0, // KEY_PATH type
                keyPath: [2147485500, 2147485463, 2147483648, 2, 0],
              },
              amount: 912698,
            },
          ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [
          [2147485500, 2147485463, 2147483648, 0, 0],
          [2147485500, 2147485463, 2147483648, 2, 0],
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
    it('Should successfully sign transaction', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Mainnet,
          fee: 170869,
          ttl: 11028300,
          inputs: [
            {
              txHashHex:
                '941a33cf9d39bba4102c4eff8bd54efd72cf93e65a023a4475ba48a58fc0de00',
              outputIndex: 0,
              path: null,
            },
          ],
          outputs: [
            {
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex:
                    '0114c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
              },
              amount: 2829131,
            },
          ],
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [[2147485500, 2147485463, 2147483648, 0, 0]],
      });
      const witness = response?.witnesses;
      console.log('witness', witness);
    });

    it('Should successfully sign transaction with tokens', async () => {
      const response = await app.signTransaction({
        tx: {
          network: Networks.Testnet,
          inputs: [
            {
              path: null,
              txHashHex:
                '14fee2d6da11448c33c63d3f33eaafa33fbb55523a8e7a59f3454d4ff143f5f6',
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
                    '0014c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
                },
              },
              amount: 3681695,
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
          ],
          fee: 190000,
          ttl: 9960000,
          validityIntervalStart: 9030000,
        },
        signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
        additionalWitnessPaths: [[2147485500, 2147485463, 2147483648, 0, 0]],
      });

      const witness = response?.witnesses;
      console.log('witness', witness);
      expect(witness).toBeDefined();
    });
  });
});
