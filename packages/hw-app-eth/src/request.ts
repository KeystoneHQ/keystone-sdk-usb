import { HDPathType } from './path-type';

export type PromiseReturnType<T extends (...args: any)=> Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : never;

export interface Response<T> {
  payload: T;
}

export type CheckLockStatusResponse = boolean;

export type CheckLockStatus = () => Promise<Response<CheckLockStatusResponse>>;

export type SignTransactionFromUrResponse = string;

export type SignTransactionFromUr = (urString: string) => Promise<Response<SignTransactionFromUrResponse>>;

export type SignTransactionRequestParams = {
  path: string,
  rawTxHex: string,
};

export type SignTransactionResponse = {
  v: string,
  r: string,
  s: string,
};

export type SignTransaction = (params: SignTransactionRequestParams) => Promise<Response<SignTransactionResponse>>;

export type ExportPubKeyResponse = string;

export enum Wallet {
  Rabby,
}

export type ExportPubKeyRequestParams = {
  n?: number,
  type: HDPathType,
  wallet: Wallet
};

export type ExportPubKey = (params: ExportPubKeyRequestParams) => Promise<Response<ExportPubKeyResponse>>;

export type ExportAddressesRequestParams = {
  start: number,
  end: number,
  type: HDPathType,
};

export type ExportAddressesResponse = string;

export type ExportAddresses = (params: ExportAddressesRequestParams) => Promise<Response<ExportAddressesResponse>>;
