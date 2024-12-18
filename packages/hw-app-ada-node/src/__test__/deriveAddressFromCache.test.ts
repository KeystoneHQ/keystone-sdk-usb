import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import Ada from '..';
import { Bip32PublicKey } from '@emurgo/cardano-serialization-lib-nodejs';
jest.setTimeout(100000);

describe('Keystone sign plutus transaction', () => {
  let app: Ada;
  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      })
    );
  });

  it('Should successfully init', async () => {
    const response = await app.initAda();
    expect(response).toBeDefined();
    // get extended public key [ 2147485500, 2147485463, 2147483648, 0, 0 ]
    const res = response.get('m/1852\'/1815\'/0\'');
    if (res) {
      // derive 1852'/1815'/0'/0/0
      const bip32PublicKeyL3 = Bip32PublicKey.from_bytes(
        Buffer.from(res?.publicKeyHex + res?.chainCodeHex, 'hex')
      );
      const childKeyL4 = bip32PublicKeyL3.derive(0);
      // l5
      const childKeyL5 = childKeyL4.derive(0);
      // we need this to sign the transaction
      const addressHex = childKeyL5.to_raw_key().to_hex();
      expect(addressHex).toEqual('cd2b047d1a803eee059769cffb3dfd0a4b9327e55bc78aa962d9bd4f720db0b2');
    }
  });
});
