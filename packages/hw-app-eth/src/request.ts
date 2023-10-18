import { Chain } from '@keystonehq/hw-transport-webusb';
import { HDPathType } from './path-type';

export type PromiseReturnType<T extends (...args: any)=> Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : never;

interface Response<T> {
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

export type ExportAddressResponse = string;

export type ExportAddressRequestParams = {
  n?: number,
  type: HDPathType,
};

export type ExportAddress = (params: ExportAddressRequestParams) => Promise<Response<ExportAddressResponse>>;

export type ExportAddressesRequestParams = {
  start: number,
  end: number,
  type: HDPathType,
};

export type ExportAddressesResponse = string;

export type ExportAddresses = (params: ExportAddressesRequestParams) => Promise<Response<ExportAddressesResponse>>;
