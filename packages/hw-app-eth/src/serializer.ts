import { ExportPubKeyParams } from './types';

export const ExportPubKeyParamsSerializer = {
  v1: (params: ExportPubKeyParams) => params,
  v2: (params: ExportPubKeyParams) => {
    const buffer = new Uint8Array(6);
    const dataView = new DataView(buffer.buffer);
    dataView.setUint16(0, params.chain ?? 0);
    dataView.setUint16(2, params.wallet ?? 0);
    dataView.setUint16(4, params.type ?? 0);
    return buffer;
  },
};
