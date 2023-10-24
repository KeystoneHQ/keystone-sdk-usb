import { Actions, TransportWebUSB, Chain, type TransportConfig } from '@keystonehq/hw-transport-webusb';
import {
  TransactionFactory,
  Transaction,
  FeeMarketEIP1559Transaction,
} from '@ethereumjs/tx';
import * as uuid from 'uuid';
import * as rlp from 'rlp';
import { DataType, EthSignRequest, ETHSignature } from '@keystonehq/bc-ur-registry-eth';
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import type {
  CheckLockStatus,
  SignTransactionFromUr,
  ExportAddress,
  PromiseReturnType,
} from './request';

export { HDPathType } from './path-type';
export * from './request';

export default class Eth {
  private transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  static async createWithUSBTransport(config?: TransportConfig): Promise<Eth> {
    const transport = await TransportWebUSB.connect(config);
    return new Eth(transport);
  }

  #send = async <T>(action: Actions, data: unknown) => {
    if (!this.transport) {
      throw new Error('Transport has not been set');
    }
    return await this.transport.send<T>(action, data);
  };

  checkLockStatus: CheckLockStatus = async () => {
    return await this.#send<PromiseReturnType<CheckLockStatus>>(Actions.CMD_CHECK_LOCK_STATUS, '');
  };

  signTransaction = async (keyringInstance, address: string, tx: any): Promise<any> => {
    const dataType =
      tx.type === 0 ? DataType.transaction : DataType.typedTransaction;
    let messageToSign;
    if (tx.type === 0) {
      messageToSign = rlp.encode((tx as Transaction).getMessageToSign(false));
    } else {
      messageToSign = (tx as FeeMarketEIP1559Transaction).getMessageToSign(
        false
      );
    }
    const hdPath = await keyringInstance._pathFromAddress(address);
    const chainId = tx.common.chainId();
    const requestId = uuid.v4();
    const ethSignRequest = EthSignRequest.constructETHRequest(
      messageToSign,
      dataType,
      hdPath,
      keyringInstance.xfp,
      requestId,
      chainId,
      address
    );

    const ur = ethSignRequest.toUR();
    const signatureResponse = await this.signTransactionFromUr(new UREncoder(
      new UR(Buffer.from((ur.cbor as unknown as WithImplicitCoercion<string>), 'hex'), ur.type),
      Infinity
    ).nextPart().toUpperCase());
    const decoder = new URDecoder();
    decoder.receivePart(signatureResponse.payload);
    if (!decoder.isComplete()) {
      throw new Error('UR did not complete');
    }

    const resultUr = decoder.resultUR();
    if (resultUr.type !== 'eth-signature') {
      throw new Error('Invalid UR type');
    }

    const ethSignature = ETHSignature.fromCBOR(Buffer.from(resultUr.cbor.toString('hex'), 'hex'));
    const signature = ethSignature.getSignature();
    const r = signature.slice(0, 32);
    const s = signature.slice(32, 64);
    const v = signature.slice(64);
    const txJson = tx.toJSON();
    txJson.v = v;
    txJson.s = s;
    txJson.r = r;
    txJson.type = tx.type;
    const transaction = TransactionFactory.fromTxData(txJson, {
      common: tx.common,
    });
    return transaction;
  };

  signTransactionFromUr: SignTransactionFromUr = async (urString: string) => {
    console.log(`[${new Date().toISOString()}] Entered method signTransactionFromUr with parameter: ${urString}`);
    const result = await this.#send<PromiseReturnType<SignTransactionFromUr>>(Actions.CMD_RESOLVE_UR, urString);
    console.log(`[${new Date().toISOString()}] Exiting method signTransactionFromUr`);
    return result;
  };

  exportAddressFromUr: ExportAddress = async (params) => {
    return await this.#send<PromiseReturnType<ExportAddress>>(Actions.CMD_EXPORT_ADDRESS, {
      chain: Chain.ETH,
      ...params,
    });
  };
}
