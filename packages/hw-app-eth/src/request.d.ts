import { Chain } from '@keystonehq/hw-transport-webusb';
import { HDPathType } from './path-type';

declare global {
  type CheckLockStatusResponse = { payload: boolean; };

  type CheckLockStatus = () => Promise<CheckLockStatusResponse>;

  type SignTransactionFromUrResponse = { payload: string; };

  type SignTransactionFromUr = (urString: string) => Promise<SignTransactionFromUrResponse>;

  type SignTransactionRequestParams = {
    path: string,
    rawTxHex: string,
  };

  type SignTransactionResponse = {
    v: string,
    r: string,
    s: string,
  };

  type SignTransaction = (params: SignTransactionRequestParams) => Promise<SignTransactionResponse>;

  type ExportAddressResponse = {
    address: string,
  };

  type ExportAddressRequestParams = {
    n?: number,
    type: HDPathType,
  };

  type ExportAddress = (params: ExportAddressRequestParams) => Promise<ExportAddressResponse>;

  type ExportAddressesRequestParams = {
    start: number,
    end: number,
    type: HDPathType,
  };

  type ExportAddressesResponse = {
    addresses: string[],
  };

  type ExportAddresses = (params: ExportAddressesRequestParams) => Promise<ExportAddressesResponse>;
}