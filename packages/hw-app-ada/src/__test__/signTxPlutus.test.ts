import Ada, { Networks, TransactionSigningMode, TxOutputDestinationType, TxRequiredSignerType } from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';

jest.setTimeout(100000);


describe('Keystone sign plutus transaction', () => {
  let app: Ada;
  
  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      }),
    );
  });

  describe('Should successfully sign plutus transaction', () => {
    it('Should successfully sign babbage plutus v2 transaction', async () => {
        const response = await app.signTransaction({
          tx: {
            network:Networks.Testnet,
            inputs: [{
              path: null,
              txHashHex: 'd44c3a039c9f4c4a117f91f7475974f64e51a3bfbc7729132f2ef0b025f76e06',
              outputIndex: 1,
            }],
            outputs: [
              {
                format: 1, // Babbage era output format
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '70dfcad2d5ae0c192e2dbcc1fab7783d13f862a06fbc59bfc73244576b',
                  },
                },
                amount: 10000000,
                datum: {
                  type: 1, // Inline datum
                  datumHex: '5579657420616e6f746865722063686f636f6c617465',
                },
              },
              {
                format: 1,
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '0080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
                  },
                },
                amount: 5000000,
                referenceScriptHex: '820258425840010000332233322222253353004333573466ebc00c00801801440204c98d4c01ccd5ce2481094e6f7420457175616c0000849848800848800480044800480041',
              },
              {
                format: 1,
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '0080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
                  },
                },
                amount: 31000000,
              },
            ],
            fee: 4000000,
          },
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
          additionalWitnessPaths: [
            [2147485500, 2147485463, 2147483648, 0, 0],
          ],
        });
      
        const witness = response?.witnesses;
        console.log('witness', witness);
        
        expect(witness).toBeDefined();
        expect(witness?.length).toBe(1); 
        
        witness?.forEach(w => {
          expect(w.path).toBeDefined();
          expect(w.witnessSignatureHex).toBeDefined();
          expect(typeof w.witnessSignatureHex).toBe('string');
        });
      });
    it('Should successfully sign babbage transaction with inline datum and reference script', async () => {
        const response = await app.signTransaction({
          tx: {
            network: Networks.Testnet,
            inputs: [{
              path: null,
              txHashHex: 'd44c3a039c9f4c4a117f91f7475974f64e51a3bfbc7729132f2ef0b025f76e06',
              outputIndex: 1,
            }],
            outputs: [
              {
                format: 1, // Babbage era output format
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '70dfcad2d5ae0c192e2dbcc1fab7783d13f862a06fbc59bfc73244576b',
                  },
                },
                amount: 10000000,
                datum: {
                  type: 1, // Inline datum
                  datumHex: '5579657420616e6f746865722063686f636f6c617465',
                },
              },
              {
                format: 1,
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '0080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
                  },
                },
                amount: 5000000,
                referenceScriptHex: '820258425840010000332233322222253353004333573466ebc00c00801801440204c98d4c01ccd5ce2481094e6f7420457175616c0000849848800848800480044800480041',
              },
              {
                format: 1,
                destination: {
                  type: TxOutputDestinationType.THIRD_PARTY,
                  params: {
                    addressHex: '0080f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277',
                  },
                },
                amount: 31000000,
              },
            ],
            fee: 4000000,
          },
          signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
          additionalWitnessPaths: [
            [2147485500, 2147485463, 2147483648, 0, 0],
          ],
        });
      
        const witness = response?.witnesses;
        console.log('witness', witness);
        
        expect(witness).toBeDefined();
        expect(witness?.length).toBe(1); 
        
        witness?.forEach(w => {
          expect(w.path).toBeDefined();
          expect(w.witnessSignatureHex).toBeDefined();
          expect(typeof w.witnessSignatureHex).toBe('string');
        });
      });
    it('Should successfully sign plutus transaction with required signers', async () => {
        const response = await app.signTransaction({
          tx: {
            network: Networks.Mainnet,
            inputs: [{
              path: null,
              txHashHex: '1789f11f03143338cfcc0dbf3a93ad8f177e8698fc37ab3ab17c954cf2b28ee8',
              outputIndex: 0,
            }],
            outputs: [{
              format: 0,
              destination: {
                type: TxOutputDestinationType.THIRD_PARTY,
                params: {
                  addressHex: '00ed9c04b17347c86bfa474bed975a01241f2ce091fb82255e16bfa884f9c4b2e3208664aa773a6b64f92bf8ec0f64b1365029632efd2ef939',
                },
              },
              amount: 989817867,
            }],
            fee: 182133,
            scriptDataHashHex: '13a83818f68bb170dff0ab8a8c0098c5a14db0e43e04c9661dd3f64deb8241c2',
            collateralInputs: [{
              path: null,
              txHashHex: '1789f11f03143338cfcc0dbf3a93ad8f177e8698fc37ab3ab17c954cf2b28ee8',
              outputIndex: 1,
            }],
            requiredSigners: [{
              type: TxRequiredSignerType.PATH,
              path: [
                2147485500,
                2147485463,
                2147483648,
                2,
                0,
              ],
            }],
          },
          signingMode: TransactionSigningMode.PLUTUS_TRANSACTION,
          additionalWitnessPaths: [
            [ 2147485500, 2147485463, 2147483648, 0, 0 ],
            [ 2147485500, 2147485463, 2147483648, 2, 0 ],
          ],
        });
      
        const witness = response?.witnesses;
        console.log('witness', witness);
        
        expect(witness).toBeDefined();
        expect(witness?.length).toBe(2); 
        
        witness?.forEach(w => {
          expect(w.path).toBeDefined();
          expect(w.witnessSignatureHex).toBeDefined();
          expect(typeof w.witnessSignatureHex).toBe('string');
        });
      }); 
  });
});
