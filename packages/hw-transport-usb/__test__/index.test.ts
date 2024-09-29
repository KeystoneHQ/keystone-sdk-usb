import { Buffer } from 'buffer';
import { decode, encode } from '../src/frame';
import { safeJSONStringify, safeJSONparse } from '../src/helper';
import { Actions } from '../src/actions';
import { TransportNodeUSB } from '../src/nodeusb';
test('EAPDU packet parsing', () => {
  // eslint-disable-next-line max-len
  const packagesBuffer = [Uint8Array.from([0, 0, 3, 0, 1, 0, 0, 227, 49, 123, 10, 9, 34, 112, 97, 121, 108, 111, 97, 100, 34, 58, 9, 102, 97, 108, 115, 101, 10, 125, 0, 0])];

  const result = decode(packagesBuffer as Buffer[]);
  expect(safeJSONparse(result.data)).toStrictEqual({
    payload: false,
  });
});

test('EAPDU packet generation', () => {
  const command = Actions.CMD_EXPORT_ADDRESS;
  const requestID = 60551;
  const strData = String('{"chain":0,"wallet":0,"type":1}');
  const packets = encode(command, requestID, strData);
  expect(packets.length).toBe(1);
  // eslint-disable-next-line max-len
  expect(packets[0]).toStrictEqual(Uint8Array.from([0, 0, 4, 0, 1, 0, 0, 236, 135, 123, 34, 99, 104, 97, 105, 110, 34, 58, 48, 44, 34, 119, 97, 108, 108, 101, 116, 34, 58, 48, 44, 34, 116, 121, 112, 101, 34, 58, 49, 125]));
});

test('EAPDU packet parsing <=> generation', () => {
  const command = Actions.CMD_EXPORT_ADDRESS;
  const requestID = 60551;
  const data = {
    chain: 0,
    wallet: 0,
    type: 2,
  };
  const packets = encode(command, requestID, safeJSONStringify(data));
  expect(packets.length).toBe(1);
  // eslint-disable-next-line max-len
  expect(packets[0]).toStrictEqual(Uint8Array.from([0, 0, 4, 0, 1, 0, 0, 236, 135, 123, 34, 99, 104, 97, 105, 110, 34, 58, 48, 44, 34, 119, 97, 108, 108, 101, 116, 34, 58, 48, 44, 34, 116, 121, 112, 101, 34, 58, 50, 125]));
  // During the decoding process, it is assumed that the final two bytes represent the status word of the request.
  // This is in accordance with the protocol defined in the EAPDU documentation.
  // For more details on the status word interpretation and related protocol specifications,
  // please refer to the documentation at: https://github.com/KeystoneHQ/keystone-suite/blob/main/docs/EAPDU_Readme.md
  const packetsBuffer = [Uint8Array.from([...packets[0], 0, 0])];
  const result = decode(packetsBuffer as Buffer[]);
  expect(safeJSONparse(result.data)).toStrictEqual(data);
});


test('connect devices', async () => {
    const solMsg = 'ff736f6c616e61206f6666636861696e00001c004c6f6e67204f66662d436861696e2054657374204d6573736167652e';
    const path = 'm/44\'/501\'/0\'';
    const msg = Buffer.from(solMsg, 'hex');

    // const transport = await TransportNodeUSB.connect({
    //     timeout: 100000,
    // });

    
  });