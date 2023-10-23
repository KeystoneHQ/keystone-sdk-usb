import { Actions, TransportWebUSB, Chain } from '@keystonehq/hw-transport-webusb';
import type {
  CheckLockStatus,
  SignTransactionFromUr,
  ExportAddress,
  PromiseReturnType,
} from './request';


export { HDPathType } from './path-type';
export * from './request';

export default class Eth {
  transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  static async createWithUSBTransport(): Promise<Eth> {
    const transport = await TransportWebUSB.connect();
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

  signTransactionFromUr: SignTransactionFromUr = async (urString: string) => {
    return await this.#send<PromiseReturnType<SignTransactionFromUr>>(Actions.CMD_RESOLVE_UR, urString);
  };

  exportAddress: ExportAddress = async (params) => {
    return await this.#send<PromiseReturnType<ExportAddress>>(Actions.CMD_EXPORT_ADDRESS, {
      chain: Chain.ETH,
      ...params,
    });
  };
}
