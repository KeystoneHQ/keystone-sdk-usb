import Ada, { MessageAddressFieldType, Networks } from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { AddressType } from '../types/public';

jest.setTimeout(100000);

describe('Keystone sign cip8 message', () => {
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

  describe('Should successfully sign cip8 message', () => {
    it('Should successfully sign cip8 message', async () => {
      const response = await app.signMessage({
        messageHex: '68656c6c6f20776f726c64',
        signingPath: [2147485500, 2147485463, 2147483648, 2, 0],
        hashPayload: false,
        addressFieldType: MessageAddressFieldType.KEY_HASH,
        preferHexDisplay: false,
      });
      const expectedResult = {
        signatureHex:
          '3142bab939dc3a73329190c55b6aa2dae169ae1e5767b96cf1d2f9c79bc7974ffbaea46c06148b0a5f3240f177cde8437d79706879a3bfbcf74e110504ea3201',
        signingPublicKeyHex:
          '66610efd336e1137c525937b76511fbcf2a0e6bcf0d340a67bcb39bc870d85e8',
        addressFieldHex:
          '1d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
      };
      expect(response).toEqual(expectedResult);
      // sleep 10000ms
      await new Promise((resolve) => setTimeout(resolve, 10000));
    });

    it('Should successfully sign cip8 message with address', async () => {
      const response = await app.signMessage({
        messageHex: '68656c6c6f20776f726c64',
        signingPath: [2147485500, 2147485463, 2147483648, 0, 0],
        hashPayload: true,
        addressFieldType: MessageAddressFieldType.ADDRESS,
        address: {
          type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: [2147485500, 2147485463, 2147483648, 0, 0],
            stakingPath: [2147485500, 2147485463, 2147483648, 2, 0],
          },
        },
        network: Networks.Testnet,
        preferHexDisplay: false,
      });
      const expectedResult = {
        signatureHex:
          '56ebf5bbea63aafbf1440cd63c5fbcbe3de799de401d48165a366e10f36c17b490c261ea8a00cf464cf7140732369cc4e333eb6714cabe625abddac1cd9dd20b',
        signingPublicKeyHex:
          'cd2b047d1a803eee059769cffb3dfd0a4b9327e55bc78aa962d9bd4f720db0b2',
        addressFieldHex:
          '0014c16d7f43243bd81478e68b9db53a8528fd4fb1078d58d54a7f11241d227aefa4b773149170885aadba30aab3127cc611ddbc4999def61c',
      };
      expect(response).toEqual(expectedResult);
      // sleep 1000ms
      await new Promise((resolve) => setTimeout(resolve, 10000));
    });
  });
});
