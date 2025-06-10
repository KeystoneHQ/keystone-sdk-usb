import { Chain } from "@keystonehq/hw-transport-usb";
import { Wallet } from "./request";

export type ExportPubKeyParams = {
  chain?: Chain;
  Wallet?: Wallet;
  [key: string]: any;
};

export type Address = {
  address: string;
  publicKey: string;
  chainCode?: string;
};

export type ExtendedPubkey = Address & {
  xpub: string;
};
