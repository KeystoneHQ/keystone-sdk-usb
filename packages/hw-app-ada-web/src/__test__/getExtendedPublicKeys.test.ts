import Ada from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { bech32_encodeAddress, str_to_path } from '../utils/address';
import { Bip32PublicKey } from '@emurgo/cardano-serialization-lib-nodejs';
jest.setTimeout(100000);
describe('Keystone getExtendedPublicKeys', () => {
  let app: Ada;

  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      })
    );
  });

  test('Should get extended public keys', async () => {
    const path = str_to_path('1852\'/1815\'/0\'');
    const extendedPublicKeys = await app.getExtendedPublicKeys({
      paths: [path],
    });
    expect(extendedPublicKeys).toBeDefined();
    expect(extendedPublicKeys.length).toBe(1);
    expect(extendedPublicKeys[0].publicKeyHex).toBe(
      '0d94fa4489745249e9cd999c907f2692e0e5c7ac868a960312ed5d480c59f2dc'
    );
    expect(extendedPublicKeys[0].chainCodeHex).toBe(
      '231adc1ee85703f714abe70c6d95f027e76ee947f361cbb72a155ac8cad6d23f'
    );
    // derive 1852'/1815'/0'/0/0
    const bip32PublicKeyL3 = Bip32PublicKey.from_bytes(
      Buffer.from(extendedPublicKeys[0].publicKeyHex + extendedPublicKeys[0].chainCodeHex, 'hex')
    );
    const childKeyL4 = bip32PublicKeyL3.derive(0);
    // l5
    const childKeyL5 = childKeyL4.derive(0);
    // we need this to sign the transaction
    expect(childKeyL5).toBeDefined();
  });
});
