import { pathToKeypath, parseResponoseUR, buildCryptoAccount, buildCryptoHDKey } from '../src/index';

describe('pathToKeypath', () => {
  it('should convert path to keypath', () => {
    const path = 'm/44\'/60\'/0\'/0/0';
    const keypath = pathToKeypath(path);
    expect(keypath.getPath()).toBe('44\'/60\'/0\'/0/0');
  });

  it('should convert path to keypath with index', () => {
    const path = 'm/44\'/60\'/0\'/0/x';
    const keypath = pathToKeypath(path, 1);
    expect(keypath.getPath()).toBe('44\'/60\'/0\'/0/1');
  });
});

describe('parseResponoseUR', () => {
  it('should parse UR', () => {
    const ur = 'UR:ETH-SIGN-REQUEST/ONADTPDAGDGEJKFXCSVANTFDPLMTCWEYVYWDKOWZZMAOHDIYYAIEGYLALFOEASMWROSTJYLFVEHECTFYUECHFEYKDWJYFWJZIACWUTGMLAROFYPTAHNSRKAEAEAEAEAEAEAEAEAEAEAEAEHDCXTTKSWKLADAFHOYCFSBZEVLGASORPNDYAWMRHAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAEAXLGKBOXSWLAAEADLALAAXADAAADAHTAADDYOEADLECSDWYKCSFNYKAEYKAEWKAEWKAOCYGMJYFLAXPAUEFEIS';
    const result = parseResponoseUR(ur);
    expect(result.cbor.toString('hex')).toBe('a501d825504a734318e69d48ae961b32e1ea76f2ff025866f864518082a20994b8c77482e45f1f44de1745f52c74426c631bdd5280b844a9059cbb0000000000000000000000005820d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000000000000000000000000000038d7ea4c680000180800301040105d90130a2018a182cf5183cf500f500f400f4021a52744703');
  });
});

describe('buildCryptoAccount', () => {
  it('should build crypto account', () => {
    const keys = [
      {
        publicKey: '02d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
        chainCode: '02d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
        mfp: '5820d178',
      },
      {
        publicKey: '12d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
        chainCode: '12d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
        mfp: '5820d178',
      },
    ];
    const origin = 'm/44\'/60\'/0\'/0';
    const note = 'note';
    const account = buildCryptoAccount({ keys, origin, note });
    expect(account.getMasterFingerprint().toString('hex')).toBe('5820d178');
    expect(account.getOutputDescriptors().length).toBe(2);
  });
});

describe('buildCryptoHDKey', () => {
  it('should build crypto hd key', () => {
    const args = {
      publicKey: '02d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
      chainCode: '02d178f480253fa119cbfee349c9b69bf8ebb900000000000000000000000000',
      mfp: '5820d178',
      origin: 'm/44\'/60\'/0\'/0',
      originIndex: 0,
      note: 'note',
    };
    const key = buildCryptoHDKey(args);
    expect(key.isMaster()).toBe(false);
    expect(key.isPrivateKey()).toBe(false);
    expect(key.getUseInfo()).toBe(undefined);
    expect(key.getOrigin().getPath()).toBe('44\'/60\'/0\'/0');
  });
});
