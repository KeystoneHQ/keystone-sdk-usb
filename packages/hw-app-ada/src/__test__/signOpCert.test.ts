import Ada from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { str_to_path } from '../utils/address';

jest.setTimeout(100000);

// abandon *11 + about
describe('Keystone sign op cert', () => {
  let app: Ada;
  
  beforeAll(async () => {
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      }),
    );
    // init ada app
    await app.initAda();
    // sleep 1000ms
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  describe('Should successfully sign op cert', () => {
    it('Should successfully sign op cert by 1852 witness path', async () => {
        const opCert = {
            kesPublicKeyHex:
              '3d24bc547388cf2403fd978fc3d3a93d1f39acf68a9c00e40512084dc05f2822',
            kesPeriod: '47',
            issueCounter: '42',
            coldKeyPath: str_to_path('1853\'/1815\'/0\'/0\''),
        };
        const response = await app.signOperationalCertificate(opCert);
        expect(response.signatureHex).toEqual('ce8d7cab55217ed17f1cceb8cb487dcbe6172fdb5794cc26f78c2f1d2495598e72beb6209f113562f9488ef6e81e3e8f758ea072c3cf9c17095868f2e9213f0a');
    });
  });
});
