import { URDecoder } from '@ngraveio/bc-ur';
import { pathToKeypath, parseResponoseUR, buildCryptoAccount, buildCryptoHDKey, convertMulitAccountToCryptoAccount, CryptoMultiAccounts } from '../src/index';
import { CryptoHDKey } from '@keystonehq/bc-ur-registry';

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

  describe('util', () => {
    it('should convert multi account to crypto account', () => {
      const UR1 = "UR:CRYPTO-MULTI-ACCOUNTS/OXADCYBGGDRPRFAOLYTAADDLOXAXHDCLAXVTUYJZOSSTCKJPOXAEMEBBCWNTSSHKIMQDPTCFDRSSCKWMVYWZPFFDSWGHFWFMSBAAHDCXOSHDAHRONSGDKKRDJYWLAEDWFMHDLBKEMSWDLACSPYCAGMFEIALEFEUEFNLRHYBDAMTAADDYOYADLNCSHFYKAEYKAEYKAYCYAALRAEGTAXJTGRIHKKJKJYJLJTIHCXEOCXGDJPJLAHIHEHDMEHDMDYHTYLLGAH";
      const UR2 = "UR:CRYPTO-MULTI-ACCOUNTS/OXADCYBGGDRPRFAOLYTAADDLOXAXHDCLAOIDRDFWGHGESFFWCNSTFEBYQDKGPLGHUECPHFHEDAYAAXGWHTYAPKBENBGSENCLRHAAHDCXUEFLUTCHIOMTAHROGERSFXNDURGHKTSWSBMWZMHTGHCAFNPAJKGEZERSOTTEZCRHAMTAADDYOYADLNCSGHYKAEYKAEYKAYCYNEJEKBGRAXJTGRIHKKJKJYJLJTIHCXEOCXGDJPJLAHIHEHDMEHDMDYMNTNFYUE";

      let URs = [UR1, UR2].map(eachUR => {
        const decoder = new URDecoder();
        decoder.receivePart(eachUR);
        if (!decoder.isComplete()) {
          throw new Error('UR is incomplete');
        }
        const resultUR = decoder.resultUR();
        return CryptoMultiAccounts.fromCBOR(resultUR.cbor);
      });

      let ca = convertMulitAccountToCryptoAccount(URs)

      expect(ca.getRegistryType().getType()).toBe('crypto-account')
      expect(ca.getOutputDescriptors().length).toBe(2)
      expect(ca.getMasterFingerprint().toString('hex')).toBe('1250b6bc')

      let outputDescriptors = ca.getOutputDescriptors()
      let key1 = outputDescriptors[0].getCryptoKey() as CryptoHDKey
      let key2 = outputDescriptors[1].getCryptoKey() as CryptoHDKey
      expect(key1.getBip32Key()).toBe('xpub6BghCcrqiqZKVhbMggpicCo9cziXGGyde4uW2adRcH6aLNYYPGL6vQRYS64pAp1cgCidiZ7zwGTHN2NmF4aJWijenLYmSeTVsyrauhWJDjA')
      expect(key2.getBip32Key()).toBe('xpub6CpjN9cV2eSSHvzA5113pRqD5qaWRhUXS7ABs5AqGiau3BbAnW2fx1JwEEwn9ugVAgx6vbpXAKEjQbKjYHHPCjaxHEwyfLcUvwxjbaBEPRe')


      let one = convertMulitAccountToCryptoAccount([URs[0]])

      expect(one.getRegistryType().getType()).toBe('crypto-account')
      expect(one.getOutputDescriptors().length).toBe(1)
      expect(one.getMasterFingerprint().toString('hex')).toBe('1250b6bc')
      let keyOne = outputDescriptors[0].getCryptoKey() as CryptoHDKey
      expect(keyOne.getBip32Key()).toBe('xpub6BghCcrqiqZKVhbMggpicCo9cziXGGyde4uW2adRcH6aLNYYPGL6vQRYS64pAp1cgCidiZ7zwGTHN2NmF4aJWijenLYmSeTVsyrauhWJDjA')

    });

    it('should throw error when mfp is not the same', () => {
      const UR1 = "ur:crypto-multi-accounts/onadcywlcscewfaolytaaddloeaxhdclaowdverokopdinhseeroisyalksaykctjshedprnuyjyfgrovawewftyghceglrpkgamtaaddyoyadlocsdwykcfadykykaeykaeykaxisjeihkkjkjyjljtihaaksdeeyeteeemeciaetieetdyiyeniadyenidhsiyidiheeenhsemieehemecdyiyeoiyiaiyeyeceneciyemahihehdmdydmeyksrlzmdi"
      const UR2 = "UR:CRYPTO-MULTI-ACCOUNTS/OXADCYBGGDRPRFAOLYTAADDLOXAXHDCLAOIDRDFWGHGESFFWCNSTFEBYQDKGPLGHUECPHFHEDAYAAXGWHTYAPKBENBGSENCLRHAAHDCXUEFLUTCHIOMTAHROGERSFXNDURGHKTSWSBMWZMHTGHCAFNPAJKGEZERSOTTEZCRHAMTAADDYOYADLNCSGHYKAEYKAEYKAYCYNEJEKBGRAXJTGRIHKKJKJYJLJTIHCXEOCXGDJPJLAHIHEHDMEHDMDYMNTNFYUE";

      let URs = [UR1, UR2].map(eachUR => {
        const decoder = new URDecoder();
        decoder.receivePart(eachUR);
        if (!decoder.isComplete()) {
          throw new Error('UR is incomplete');
        }
        const resultUR = decoder.resultUR();
        return CryptoMultiAccounts.fromCBOR(resultUR.cbor);
      });

      expect(() => convertMulitAccountToCryptoAccount(URs)).toThrow('All accounts must have the same Master Fingerprint');
    })

    it('should error when ur list is empty', () => {
      expect(() => convertMulitAccountToCryptoAccount([])).toThrow('input list is empty');
    })
  })
})  
