import { Buffer } from 'buffer';
import { Actions } from './actions';

const MAX_PACKET_SIZE = 64;
const MAX_DATA_SIZE = 59;
const HEADER_SIZE = 5;
const FOOTER_SIZE = 0;
const TRUE = 1;
const FALSE = 0;

const toBool = (data: any) => {
  if (data === TRUE) return true;
  if (data === FALSE) return false;
  return data;
}

const dataParser = (buffer: Uint8Array, packetIndex: number) => {
  /**
   * If the buffer length is 0, return null
   */
  if (buffer.length === 0) return null;
  /**
   * If the buffer length is 1, return the boolean value
   */
  if (packetIndex === 0 && buffer.length === 1) return toBool(buffer[0]);
  const textDecoder = new TextDecoder('utf-8');
  return textDecoder.decode(buffer);
}

export const generateApduPackets = (command: Actions, strData: string) => {
  if (!strData || strData.length === 0) {
    return [new Uint8Array([0x00, command, 0x01, 0x00, 0x00])];
  }

  let data = new TextEncoder().encode(strData);
  let packets: Uint8Array[] = [];
  let totalPackets = Math.ceil(data.length / MAX_DATA_SIZE);

  for (let i = 0; i < totalPackets; i++) {
    let packetData = data.slice(i * MAX_DATA_SIZE, (i + 1) * MAX_DATA_SIZE);
    let packetLen = HEADER_SIZE + packetData.length + FOOTER_SIZE;

    let packet = new Uint8Array(packetLen);
    packet[0] = 0x00;  // Fixed header
    packet[1] = command;  // Command byte
    packet[2] = totalPackets;  // Total packets
    packet[3] = i;  // Current packet index
    packet[4] = packetData.length;  // Data length

    packet.set(packetData, HEADER_SIZE);  // Copy the data

    packets.push(packet);
  }

  return packets;
}

export const parseApduPacket = (uint8Array: Uint8Array) => {
  if (uint8Array.length < HEADER_SIZE) throw new Error('Invalid packet size');
  const dataView = new DataView(uint8Array.buffer);
  const cla = dataView.getUint8(0);
  const ins = dataView.getUint8(1);
  const totalPackets = dataView.getUint8(2);
  const packetIndex = dataView.getUint8(3);
  const packetDataSize = dataView.getUint8(4);

  const packetData = new Uint8Array(uint8Array.buffer, 5, packetDataSize);
  const data = dataParser(packetData, packetIndex);

  return {
    cla,
    ins,
    totalPackets,
    packetIndex,
    data,
  };
}