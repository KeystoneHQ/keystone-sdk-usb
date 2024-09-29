import { Chain } from '@keystonehq/hw-transport-usb';
import { Wallet } from './request';

export type ExportPubKeyParams = {
  chain?: Chain;
  Wallet?: Wallet;
  [key: string]: any;
}
