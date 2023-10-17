import { Status } from './status-code';

export class TransportError extends Error {
  code: number;
  details: string;

  constructor(message: string, code: number, details?: string) {
    super(`[Transport Error]: ${message}`);
    this.name = 'TransportError';
    this.code = code;
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
  [Status.ERR_NO_DEVICE_FOUND]: 'No USB device is found.',
};

export const throwTransportError = (status: Status): never => {
  const message = ErrorInfo[status] ?? 'Unknown error';
  throw new TransportError(message, status);
};
