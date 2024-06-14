import { Actions, TransportWebUSB, Chain, type TransportConfig, logMethod } from '@keystonehq/hw-transport-webusb';
import {
  Transaction,
  FeeMarketEIP1559Transaction,
} from '@ethereumjs/tx';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';
import * as uuid from 'uuid';
import * as rlp from 'rlp';
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import {
  DataType,
  EthSignRequest,
  CryptoAccount,
  CryptoHDKey,
} from '@keystonehq/bc-ur-registry-eth';
import {
  Wallet,
  CheckLockStatus,
  SignTransactionFromUr,
  ExportPubKey,
  PromiseReturnType,
} from './request';
import { parseExportedPublicKeyOrAddress, parseTransaction } from './ur-parser';
import { ExportPubKeyParams } from './types';
import { ExportPubKeyParamsSerializer } from './serializer';

export { HDPathType } from './path-type';
export * from './request';

export default class Eth {
  private transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  static async createWithUSBTransport(
    config?: TransportConfig,
  ): Promise<Eth> {
    const transport = await TransportWebUSB.connect(config);
    await transport.close();
    return new Eth(transport);
  }

  #send = async <T>(action: Actions, data: unknown) => {
    if (!this.transport) {
      throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
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
      throwTransportError(Status.ERR_UR_INCOMPLETE);
    }

    return parseTransaction(signatureResponse.payload, tx);
  };

  @logMethod
  async signTransactionFromUr(urString: string) {
    const result = await this.#send<PromiseReturnType<SignTransactionFromUr>>(Actions.CMD_RESOLVE_UR, urString);
    return result;
  }

  exportPubKeyFromUr = async (
    params: ExportPubKeyParams,
    serializer: (params: ExportPubKeyParams) => any = ExportPubKeyParamsSerializer.v2,
  ): Promise<CryptoHDKey | CryptoAccount> => {
    const { payload: pubKeyUr } = await this.#send<PromiseReturnType<ExportPubKey>>(
      Actions.CMD_EXPORT_ADDRESS, serializer({
        chain: Chain.ETH,
        wallet: Wallet.Rabby,
        ...params,
      })
    );

    return parseExportedPublicKeyOrAddress(pubKeyUr);
  };
}
