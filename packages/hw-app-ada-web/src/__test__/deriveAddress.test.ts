import Ada, { Networks } from '..';
import { TransportNodeUSB } from '@keystonehq/hw-transport-nodeusb';
import { bech32_encodeAddress, str_to_path } from '../utils/address';
import { AddressType, DeviceOwnedAddress, Network } from '../index';

type ShelleyTestCase = {
  testName: string;
  network: Network;
  addressParams: DeviceOwnedAddress;
  result: string;
};

export const shelleyTestCases: ShelleyTestCase[] = [
  {
    testName: 'base address path/path 1',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1qy2vzmtlgvjrhkq50rngh8d482zj3l20kyrc6kx4ffl3zfqayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqf7zhh2',
  },
  {
    testName: 'base address path/path 2',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/1"),
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result:
      'addr1q9d9xypc9xnnstp2kas3r7mf7ylxn4sksfxxypvwgnc63vcayfawlf9hwv2fzuygt2km5v92kvf8e3s3mk7ynxw77cwqx9wh62',
  },
  {
    testName: 'enterprise path 1',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.ENTERPRISE_KEY,
      params: {
        spendingPath: str_to_path("1852'/1815'/0'/0/0"),
      },
    },
    result: 'addr1vy2vzmtlgvjrhkq50rngh8d482zj3l20kyrc6kx4ffl3zfqcrdgvh',
  },
  {
    testName: 'reward path 1',
    network: Networks.Mainnet,
    addressParams: {
      type: AddressType.REWARD_KEY,
      params: {
        stakingPath: str_to_path("1852'/1815'/0'/2/0"),
      },
    },
    result: 'stake1uywjy7h05jmhx9y3wzy94td6xz4txynuccgam0zfn800v8qq33z29',
  },
];

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

  describe('Should successfully derive Shelley address', () => {
    for (const {
      testName,
      network,
      addressParams,
      result: expectedResult,
    } of shelleyTestCases) {
      it(testName, async () => {
        const { addressHex } = await app.deriveAddress({
          network,
          address: addressParams,
        });
        expect(bech32_encodeAddress(Buffer.from(addressHex, 'hex'))).toEqual(
          expectedResult
        );
      });
    }
  });
});
