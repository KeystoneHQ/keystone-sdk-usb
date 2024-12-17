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
      }),
    );
  });

  it('Should successfully init', async () => {
    const response = await app.initAda();
    console.log(response);
    expect(response).toBeDefined();
    // get extended public key [ 2147485500, 2147485463, 2147483648, 0, 0 ]
    const res = response.get('m/1852\'/1815\'/0\'');
    expect(res).toBeDefined();
    if (res) {
        // derive 1852'/1815'/0'/0/0
        const bip32PublicKeyL3 = Bip32PublicKey.from_bytes(
            Buffer.from(res?.publicKeyHex + res?.chainCodeHex, 'hex')
        );
        const childKeyL4 = bip32PublicKeyL3.derive(0);
        // l5 
        const childKeyL5 = childKeyL4.derive(0);
        // we need this to sign the transaction  
        console.log(childKeyL5.to_raw_key().to_hex()); 
    }
});
});
