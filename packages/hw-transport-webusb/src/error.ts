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