import Ada, {MessageAddressFieldType, Networks } from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { AddressType } from '../types/public';

jest.setTimeout(100000);


describe('Keystone sign cip8 message', () => {
  let app: Ada;
  
  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      }),
    );
    await app.initAda();
    await new Promise(resolve => setTimeout(resolve, 10000));
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
        console.log(response);
        // sleep 1000ms
        await new Promise(resolve => setTimeout(resolve, 10000));
    });
    
    
    it('Should successfully sign cip8 message with address', async () => {
        const response = await app.signMessage({
          messageHex: '68656c6c6f20776f726c64',
          signingPath: [2147485500, 2147485463, 2147483648, 0, 0],
          hashPayload: false,
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
        console.log(response);
    });
  });
});
