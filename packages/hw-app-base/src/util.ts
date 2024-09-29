
// This is module for some helper functions for keystone app.

import { CryptoAccount, CryptoMultiAccounts, ScriptExpressions, CryptoOutput } from "@keystonehq/bc-ur-registry";


export const convertMulitAccountToCryptoAccount = (accounts: CryptoMultiAccounts[]): CryptoAccount => {
    
    const masterFingerprints = accounts.map(account => account.getMasterFingerprint().toString('hex'));

    if (masterFingerprints.length === 0) {
        throw new Error('input list is empty');
    }

    if (new Set(masterFingerprints).size !== 1) {
        throw new Error('All accounts must have the same Master Fingerprint');
    }

    return new CryptoAccount(
        Buffer.from(masterFingerprints[0], 'hex'),
        accounts.flatMap(account => account.getKeys()).map((key) => {
            return new CryptoOutput(
                // choose same script for all keys, this is a expression for bitcoin script
                // current this type is not be fully used to identify the script type
                [ScriptExpressions.RAW_SCRIPT],
                key
            )
        })
    )
}