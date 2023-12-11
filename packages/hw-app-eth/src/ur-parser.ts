import {
  ETHSignature,
  CryptoAccount,
  CryptoHDKey,
} from '@keystonehq/bc-ur-registry-eth';
import { URDecoder } from '@ngraveio/bc-ur';
import {
  TransactionFactory,
  Transaction,
  FeeMarketEIP1559Transaction,
} from '@ethereumjs/tx';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';

export const parseTransaction = (data: string, tx: FeeMarketEIP1559Transaction | Transaction) => {
  const decoder = new URDecoder();
    decoder.receivePart(data);
    if (!decoder.isComplete()) {
      throwTransportError(Status.ERR_UR_INCOMPLETE);
    }

    const resultUr = decoder.resultUR();
    if (resultUr.type !== 'eth-signature') {
      throwTransportError(Status.ERR_UR_INVALID_TYPE);
    }

    const ethSignature = ETHSignature.fromCBOR(Buffer.from(resultUr.cbor.toString('hex'), 'hex'));
    const signature = ethSignature.getSignature();
    const r = signature.slice(0, 32);
    const s = signature.slice(32, 64);
    const v = signature.slice(64);
    const txJson = tx.toJSON();
    txJson.v = v as any;
    txJson.s = s as any;
    txJson.r = r as any;
    txJson.type = tx.type as any;
    const transaction = TransactionFactory.fromTxData(txJson, {
      common: tx.common,
    });
    return transaction;
};

export const parseExportedPublicKeyOrAddress = (data: string) => {
  const decoder = new URDecoder();
  decoder.receivePart(data);
  const result = decoder.resultUR();
  const cbor = result.cbor.toString('hex');
  if (result.type === 'crypto-hdkey') {
    return CryptoHDKey.fromCBOR(Buffer.from(cbor, 'hex'));
  } else {
    return CryptoAccount.fromCBOR(Buffer.from(cbor, 'hex'));
  }
};