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
