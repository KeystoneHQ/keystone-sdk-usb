import Ada from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';

describe('Keystone getVersion', () => {
  let app: Ada;
  
  beforeAll(async () => {
    jest.setTimeout(10000);
    
    app = new Ada(
      await TransportNodeUSB.connect({
        timeout: 100000,
      }),
    );
  });

  test('Should get app version', async () => {
    const version = await app.getAppConfig();
    expect(version).toBeDefined();
    expect(version.version).toBeDefined();
    expect(version.mfp).toBeDefined();
  });
});