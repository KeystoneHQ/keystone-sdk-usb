import { Buffer } from 'buffer';

const MAX_PACKET_SIZE = 64;
const MAX_DATA_SIZE = 59;
const HEADER_SIZE = 5;
const FOOTER_SIZE = 0;

export const generateApduPackets = (command, strData) => {
  // mock:
  // strData = 'UR:ETH-SIGN-REQUEST/OLADTPDAGDWMZTFTZORNGEFGWNNLGAIACSSBIYEHFNAOHDDLAOWEAHAOLRHKISDLAELRHKISDLBTLFGMAYMWGAGYFLASPLMDMYBGNDATEEISPLLGBABEFXLSIMVALNASCSGLJPNBAELARTAXAAAAAHAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYBNHEGSHYAMGHIHSNEOKTVWHDVSJETIWDTYPLVYGYKBFNNSVAWMNEFHLADWBB';
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
  const textDecoder = new TextDecoder('utf-8');
  const dataString = textDecoder.decode(packetData);

  return {
    cla,
    ins,
    totalPackets,
    packetIndex,
    dataString,
  };
}