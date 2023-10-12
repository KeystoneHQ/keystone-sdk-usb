type CheckLockStatusResponse = { payload: boolean; };
type CheckLockStatus = () => Promise<CheckLockStatusResponse>;
type SignTransactionResponse = { payload: string; };
type SignTransaction = (urString: string) => Promise<SignTransactionResponse>;