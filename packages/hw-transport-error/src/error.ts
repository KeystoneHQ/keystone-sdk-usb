import { Status } from './status-code';

export class TransportError extends Error {
  transportErrorCode: number;
  details: string;

  constructor(message: string, transportErrorCode: number, details?: string) {
    super(`${message} (error_code: ${transportErrorCode})`);
    this.name = 'TransportError';
    this.transportErrorCode = transportErrorCode;
    this.details = details ?? '';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const ErrorInfo = {
  [Status.ERR_DEVICE_NOT_OPENED]: 'The USB device cannot be connected.',
  [Status.ERR_DEVICE_NOT_FOUND]: 'The USB device cannot be found.',
  [Status.ERR_RESPONSE_STATUS_NOT_OK]: 'The response status is not ok.',
  [Status.ERR_TIMEOUT]: 'The request timed out.',
  [Status.ERR_DATA_TOO_LARGE]: 'The data is too large.',
  [Status.ERR_NOT_SUPPORTED]: 'The USB device is not supported.',
  [Status.ERR_BUFFER_MISMATCH]: 'The buffer mismatched.',
  [Status.ERR_RECEIVED_BABBLE]: 'The USB device received babble.',
  [Status.ERR_INVALID_PACKET_SIZE]: 'The packet size is invalid.',
  [Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET]: 'The transport has not been set.',
  [Status.ERR_UR_INCOMPLETE]: 'The UR is incomplete.',
  [Status.ERR_UR_INVALID_TYPE]: 'The UR type is invalid.',
};

export const throwTransportError = (status: Status): never => {
  const message = ErrorInfo[status] ?? 'Unknown error';
  throw new TransportError(message, status);
};
