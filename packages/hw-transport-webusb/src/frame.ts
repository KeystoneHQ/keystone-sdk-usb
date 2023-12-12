import { Buffer } from 'buffer';
import { setUint16, safeJSONparse } from './helper';
import { Actions } from './actions';
import {
  OFFSET_CLA,
  OFFSET_INS,
  OFFSET_P1,
  OFFSET_P2,
  OFFSET_LC,
  OFFSET_CDATA,
} from './constants';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';

const MAX_DATA_SIZE = 55;
const HEADER_SIZE = 9;

const dataParser = (buffer: Uint8Array) => {
  /**
   * If the buffer length is 0, return null
   */
  if (buffer.length === 0) return null;

  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(buffer);
};

/**
 * Encode the data into packets
 * @param command 
 * @param requestID 
 * @param strData 
 * @returns 
 */
export const encode = (command: Actions, requestID: number, strData: string) => {
  if (!strData || strData.length === 0) {
    const packet = new Uint8Array(9);
    packet[OFFSET_CLA] = 0;  // Fixed header
    setUint16(packet, OFFSET_INS, command);  // Command byte
    setUint16(packet, OFFSET_P1, 1);  // Total packets
    setUint16(packet, OFFSET_P2, 0);  // Current packet index
    setUint16(packet, OFFSET_LC, requestID);  // request ID
    return [packet];
  }

  const data = new TextEncoder().encode(strData);
  const packets: Uint8Array[] = [];
  const totalPackets = Math.ceil(data.length / MAX_DATA_SIZE);

  for (let i = 0; i < totalPackets; i++) {
    const packetData = data.slice(i * MAX_DATA_SIZE, (i + 1) * MAX_DATA_SIZE);
    const packetLen = HEADER_SIZE + packetData.length;

    const packet = new Uint8Array(packetLen);
    packet[OFFSET_CLA] = 0;  // Fixed header
    setUint16(packet, OFFSET_INS, command);  // Command byte
    setUint16(packet, OFFSET_P1, totalPackets);  // Total packets
    setUint16(packet, OFFSET_P2, i);  // Current packet index
    setUint16(packet, OFFSET_LC, requestID);  // requesr ID

    packet.set(packetData, HEADER_SIZE);  // Copy the data

    packets.push(packet);
  }

  return packets;
};

const parseEApduPacket = (uint8Array: Uint8Array) => {
  if (uint8Array.length < HEADER_SIZE) throwTransportError(Status.ERR_INVALID_PACKET_SIZE);
  const dataView = new DataView(uint8Array.buffer);
  const cla = dataView.getUint8(0);
  const ins = dataView.getUint16(OFFSET_INS);
  const totalPackets = dataView.getUint16(OFFSET_P1);
  const packetIndex = dataView.getUint16(OFFSET_P2);
  const requestID = dataView.getUint16(OFFSET_LC);
  const statusOffset = uint8Array.buffer.byteLength - 2;
  const status = dataView.getUint16(statusOffset);

  // Calculate packetDataSize by subtracting the length of the status from the length of the packet header
  const packetDataSize = statusOffset - OFFSET_CDATA;
  const packetData = new Uint8Array(uint8Array.buffer, OFFSET_CDATA, packetDataSize);
  const data = dataParser(packetData);

  return {
    cla,
    ins,
    totalPackets,
    packetIndex,
    requestID,
    data,
    status,
  };
};

/**
 * Decode the packets into data
 * @param buffers 
 * @returns 
 */
export const decode = (buffers: Buffer[]): {
  data: string,
  status?: Status
} => {
  const result: {
    data: string,
    status?: Status
  } = buffers
    .map((buffer) => parseEApduPacket(buffer))
    .sort(({ packetIndex: a }, { packetIndex: b }) => a - b)
    .reduce<{ data: string, status?: number }>((acc, { data, status }) =>
      ({ data: acc.data + data, status }), { data: '' });
  return result;
};
