import { Actions, type TransportWebUSB } from '@keystonehq/hw-transport-webusb';

export default class Eth {
  transport: Nullable<TransportWebUSB>;

  constructor(transport: TransportWebUSB) {
    this.transport = transport;
  }

  #send = async (action: Actions, data: string) => await this.transport?.send(action, data);

  checkLockStatus = async () => await this.#send(Actions.CMD_CHECK_LOCK_STATUS, '');

  signTransaction = async (urString: string) => {
    if (!urString) {
      throw new Error('Invalid UR string');
    }
    const isLocked = await this.checkLockStatus();
    if (isLocked) {
      throw new Error('Device is locked');
    }
    return await this.#send(Actions.CMD_RESOLVE_UR, urString);
  }
}