import { Actions, type TransportWebUSB, Chain } from '@keystonehq/hw-transport-webusb';

export { HDPathType } from './path-type';

export default class Eth {
  transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  #send = async <T>(action: Actions, data: unknown) => {
    return await this.transport!.send<T>(action, data);
  };

  checkLockStatus: CheckLockStatus = async () => {
    return await this.#send<CheckLockStatusResponse>(Actions.CMD_CHECK_LOCK_STATUS, '');
  };

  signTransactionFromUr: SignTransactionFromUr = async (urString: string) => {
    return await this.#send<SignTransactionFromUrResponse>(Actions.CMD_RESOLVE_UR, urString);
  };

  exportAddress: ExportAddress = async (params) => {
    return await this.#send<ExportAddressResponse>(Actions.CMD_EXPORT_ADDRESS, {
      chain: Chain.ETH,
      ...params,
    });
  };

  exportAddresses: ExportAddresses = async (params) => {
    return await this.#send<ExportAddressesResponse>(Actions.CMD_EXPORT_ADDRESSES, {
      chain: Chain.ETH,
      ...params,
    });
  };
}