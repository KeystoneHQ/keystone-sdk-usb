import { Chain } from '@keystonehq/hw-transport-webusb';
import { Wallet } from './request';

export type ExportPubKeyParams = {
  chain?: Chain;
  Wallet?: Wallet;
  [key: string]: any;
}
