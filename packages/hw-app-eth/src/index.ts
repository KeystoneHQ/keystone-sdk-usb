import { Actions, type TransportWebUSB } from '@keystonehq/hw-transport-webusb';

export default class Eth {
  transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  #send = async <T>(action: Actions, data: string) => await this.transport!.send<T>(action, data);

  checkLockStatus: CheckLockStatus = async () => await this.#send<CheckLockStatusResponse>(Actions.CMD_CHECK_LOCK_STATUS, '');

  signTransaction: SignTransaction = async (urString: string) =>
    await this.#send<SignTransactionResponse>(Actions.CMD_RESOLVE_UR, urString);
}