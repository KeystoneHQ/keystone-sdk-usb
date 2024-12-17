/* eslint-disable max-len */
import {
  CryptoKeypath,
  CryptoMultiAccounts,
  Curve,
  DerivationAlgorithm,
  KeyDerivation,
  KeyDerivationSchema,
  PathComponent,
  QRHardwareCall,
  QRHardwareCallType,
  QRHardwareCallVersion,
} from '@keystonehq/bc-ur-registry';
import { Status, throwTransportError } from '@keystonehq/hw-transport-error';
import { Actions, TransportHID } from '@keystonehq/hw-transport-usb';
import { UR, URDecoder, UREncoder } from '@ngraveio/bc-ur';
import {
  Network,
  DerivedAddress,
  BIP32Path,
  ExtendedPublicKey,
  HARDENED,
  AddressType,
  NativeScript,
  NativeScriptHashDisplayFormat,
  NativeScriptHash,
  NativeScriptType,
  SignTransactionRequest,
  SignedTransactionData,
  TransactionSigningMode,
  TxOutputDestinationType,
  CertificateType,
  DatumType,
  Witness,
  PoolKeyType,
  PoolRewardAccountType,
  PoolOwnerType,
  RelayType,
  MessageData,
  SignedMessageData,
  MessageAddressFieldType,
  CIP36Vote,
  SignedCIP36VoteData,
  OperationalCertificate,
  OperationalCertificateSignature,
} from './types/public';
import { isArray, parseBIP32Path, validate } from './utils/parse';
import { InvalidData, InvalidDataReason } from './errors';
import { parseAddress } from './parsing/address';
import * as blake2 from 'blake2';
import {
  CredentialType,
  DRepType,
  FixLenHexString,
  KEY_HASH_LENGTH,
  ParsedAnchor,
  ParsedCertificate,
  ParsedCredential,
  ParsedDRep,
  ParsedPoolParams,
  ParsedTransaction,
  SCRIPT_HASH_LENGTH,
  SpendingDataSourcePath,
  SpendingDataSourceScriptHash,
  SpendingDataSourceType,
  StakingDataSourcePath,
  StakingDataSourceScriptHash,
  StakingDataSourceType,
  Uint64_str,
  ValidBIP32Path,
} from './types/internal';
import { parseNetwork } from './parsing/network';
import {
  parseNativeScript,
  parseNativeScriptHashDisplayFormat,
} from './parsing/nativeScript';
import * as cardanoSerialization from '@emurgo/cardano-serialization-lib-nodejs';
import { parseSignTransactionRequest } from './parsing/transaction';
import {
  CardanoCertKeyData,
  CardanoSignature,
  CardanoSignRequest,
  CardanoUtxoData,
  CardanoSignCip8DataRequest,
  MessageAddressFieldType as KeystoneMessageAddressFieldType,
  CardanoSignCip8DataSignature,
  CardanoSignDataRequest,
  CardanoSignDataSignature,
} from '@keystonehq/bc-ur-registry-cardano';
import * as bech32 from 'bech32';
import * as uuid from 'uuid';
import { bech32_encodeAddress } from './utils/address';
export * from './errors';
export * from './types/public';
export * from './types/internal';
import { classifyPath, PathTypes } from './keystoneUtils';
import {
  Transaction as CSLTransaction,
  TransactionBody as CSLTransactionBody,
  TransactionInputs as CSLTransactionInputs,
  TransactionInput as CSLTransactionInput,
  TransactionHash as CSLTransactionHash,
  TransactionOutputs as CSLTransactionOutputs,
  TransactionOutput as CSLTransactionOutput,
  Address as CSLAddress,
  Value as CSLValue,
  BigNum as CSLBigNum,
  TransactionWitnessSet as CSLTransactionWitnessSet,
  AuxiliaryData as CSLAuxiliaryData,
  DataHash as CSLDataHash,
  PlutusData as CSLPlutusData,
  ScriptRef as CSLScriptRef,
  Certificates as CSLCertificates,
  Certificate as CSLCertificate,
  Bip32PublicKey as CSLBip32PublicKey,
} from '@emurgo/cardano-serialization-lib-nodejs';
import { parseMessageData } from './parsing/messageData';
import { parseCVote } from './parsing/cVote';
import { DeviceOwnedAddress } from '../lib/types/public';
import { parseOperationalCertificate } from './parsing/operationalCertificate';
import { uint64_to_buf } from './utils/serialize';
/**
 * Default Cardano networks
 * @see [[Network]]
 */
export const Networks = {
  Mainnet: {
    networkId: 0x01,
    protocolMagic: 764824073,
  } as Network,
  Testnet: {
    networkId: 0x00,
    protocolMagic: 1097911063,
  } as Network,
};

/**
 * Derive address ([[Ada.deriveAddress]]) request data
 * @category Main
 * @see [[DeriveAddressResponse]]
 */
export type DeriveAddressRequest = {
  network: Network;
  address: DeviceOwnedAddress;
};

/**
 * Derive address ([[Ada.deriveAddress]]) response data
 * @category Main
 * @see [[DeriveAddressRequest]]
 */
export type DeriveAddressResponse = DerivedAddress;

/**
 * Get multiple public keys ([[Ada.getExtendedPublicKeys]]) request data
 * @category Main
 * @see [[GetExtendedPublicKeysResponse]]
 */
export type GetExtendedPublicKeysRequest = {
  /** Paths to public keys which should be derived by the device */
  paths: BIP32Path[];
};

/**
 * [[Ada.getExtendedPublicKeys]] response data
 * @category Main
 * @see [[GetExtendedPublicKeysRequest]]
 */
export type GetExtendedPublicKeysResponse = Array<ExtendedPublicKey>;

/**
 * Show address on device ([[Ada.showAddress]]) request data
 * @category Main
 */
export type ShowAddressRequest = DeriveAddressRequest;

/**
 * Derive native script hash ([[Ada.deriveNativeScriptHash]]) request data
 * @category Main
 * @see [[DeriveNativeScriptHashResponse]]
 */
export type DeriveNativeScriptHashRequest = {
  script: NativeScript;
  displayFormat: NativeScriptHashDisplayFormat;
};

/**
 * Derive native script hash ([[Ada.deriveNativeScriptHash]]) response data
 * @category Main
 * @see [[DeriveNativeScriptHashRequest]]
 */
export type DeriveNativeScriptHashResponse = NativeScriptHash;

/**
 * Sign transaction ([[Ada.signTransaction]]) response data
 * @category Main
 * @see [[SignTransactionRequest]]
 */
export type SignTransactionResponse = SignedTransactionData;

/**
 * Sign CIP-8 message ([[Ada.signMessage]]) request data
 * @category Main
 * @see [[SignMessageResponse]]
 */
export type SignMessageRequest = MessageData;
/**
 * Sign CIP-8 message ([[Ada.signMessage]]) response data
 * @category Main
 * @see [[SignMessageRequest]]
 */
export type SignMessageResponse = SignedMessageData;

/**
 * Sign CIP36 vote ([[Ada.signCIP36Vote]]) request data
 * @category Main
 * @see [[SignCIP36VoteResponse]]
 */
export type SignCIP36VoteRequest = CIP36Vote;
/**
 * Sign CIP36 vote ([[Ada.signCIP36Vote]]) response data
 * @category Main
 * @see [[SignCIP36VoteRequest]]
 */
export type SignCIP36VoteResponse = SignedCIP36VoteData;

/**
 * Sign operational certificate ([[Ada.signOperationalCertificate]]) request data
 * @category Main
 * @see [[SignOperationalCertificateResponse]]
 */
export type SignOperationalCertificateRequest = OperationalCertificate;
/**
 * Sign operational certificate ([[Ada.signOperationalCertificate]]) response data
 * @category Main
 * @see [[SignOperationalCertificateRequest]]
 */
export type SignOperationalCertificateResponse =
  OperationalCertificateSignature;

export default class Ada {
  private transport: TransportHID;
  private mfp: string | undefined;
  // path - public key map
  private pathToPublicKeyMap: Map<string, ExtendedPublicKey> = new Map();
  /**
   * Constructs a new instance of the class.
   *
   * @param transport - An object of type TransportWebUSB
   * @param mfp - Optional parameter of type string, default is undefined, but the mfp should exist in the signing process.
   */
  constructor(transport: TransportHID, mfp?: string) {
    // Initialize Ada connection
    this.transport = transport;
    if (mfp) {
      this.mfp = mfp;
    }
  }

  async initAda(): Promise<Map<string, ExtendedPublicKey>> {
    // todo we need cache the xpub to derive the address
    const paths: ValidBIP32Path[] = [];
    const path1 = parseBIP32Path(
      [HARDENED + 1852, HARDENED + 1815, HARDENED],
      InvalidDataReason.INVALID_PATH
    );
    const path2 = parseBIP32Path(
      [HARDENED + 1853, HARDENED + 1815, HARDENED, HARDENED],
      InvalidDataReason.INVALID_PATH
    );

    paths.push(path1);
    paths.push(path2);

    const res = await this.getExtendedPublicKeys({ paths: paths });
    this.pathToPublicKeyMap.set(validBIP32PathToKeypathString(path1), res[0]);
    this.pathToPublicKeyMap.set(validBIP32PathToKeypathString(path2), res[1]);
    // get app config
    const appConfig = await this.getAppConfig();
    this.mfp = appConfig.mfp;
    return this.pathToPublicKeyMap;
  }

  private getPublicKeyHex(path: ValidBIP32Path): string {
    // 1853
    if (path[0] === HARDENED + 1853) {
      const publicKeyHex = this.pathToPublicKeyMap.get(
        validBIP32PathToKeypathString(path)
      )?.publicKeyHex;
      if (!publicKeyHex) {
        throw new Error(
          'path not found in the memory cache , please call initAda function first'
        );
      }
      return publicKeyHex;
    }
    // 1852 and other path
    const expectedPath = validBIP32PathToKeypathString(path);
    const keysCache = this.pathToPublicKeyMap.keys();
    const findResultKey = Array.from(keysCache).find((key) =>
      expectedPath.includes(key)
    );
    if (!findResultKey) {
      throw new Error(
        'path not found in the memory cache , please call initAda function first'
      );
    }
    const extendedPublicKey = this.pathToPublicKeyMap.get(findResultKey);
    if (!extendedPublicKey) {
      throw new Error(
        'path not found in the memory cache , please call initAda function first'
      );
    }
    const bip32PublicKeyL3 = CSLBip32PublicKey.from_bytes(
      Buffer.from(
        extendedPublicKey.publicKeyHex + extendedPublicKey.chainCodeHex,
        'hex'
      )
    );
    const childKeyL4 = bip32PublicKeyL3.derive(path[path.length - 2]);
    const childKeyL5 = childKeyL4.derive(path[path.length - 1]);
    // pubkey
    return childKeyL5.to_raw_key().to_hex();
  }

  private precheck() {
    if (!this.transport) {
      throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
    }
    if (!this.mfp) {
      throw new Error('missing mfp for this wallet');
    }
    if (this.pathToPublicKeyMap.size === 0) {
      throw new Error(
        'missing path to public key map, please call initAda first'
      );
    }
  }

  private async sendToDevice(actions: Actions, data: any): Promise<any> {
    return this.transport.send(actions, data);
  }

  private async checkDeviceLockStatus(): Promise<boolean> {
    const result = await this.sendToDevice(Actions.CMD_CHECK_LOCK_STATUS, '');
    return result.payload;
  }

  /**
   * Retrieves the configuration information of the connected hardware device.
   *
   * This method sends a request to the device to get its version information,
   * then parses the response to extract the firmware version and wallet master fingerprint.
   *
   * @returns A Promise that resolves to an object containing:
   *          - version: A string representing the firmware version of the device
   *          - mfp: A string representing the master fingerprint of the wallet
   * @throws Will throw an error if the device communication fails or if the response cannot be parsed
   */
  async getAppConfig(): Promise<{ version: string; mfp: string }> {
    const res = await this.sendToDevice(Actions.CMD_GET_DEVICE_VERSION, '');
    return {
      version: res.firmwareVersion,
      mfp: res.walletMFP,
    };
  }

  /**
   * Get several public keys; one for each of the specified BIP 32 path.
   *
   * @param paths The paths. A path must begin with `44'/1815'/account'` or `1852'/1815'/account'`, and may be up to 10 indexes long.
   * @returns The extended public keys (i.e. with chaincode) for the given paths.
   *
   * @example
   * ```
   * const [{ publicKey, chainCode }] = await ada.getExtendedPublicKeys([[ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]]);
   * console.log(publicKey);
   * ```
   */
  async getExtendedPublicKeys({
    paths,
  }: GetExtendedPublicKeysRequest): Promise<GetExtendedPublicKeysResponse> {
    validate(isArray(paths), InvalidDataReason.GET_EXT_PUB_KEY_PATHS_NOT_ARRAY);
    paths.map((path) => parseBIP32Path(path, InvalidDataReason.INVALID_PATH));
    const curve = Curve.ed25519;
    const algo = DerivationAlgorithm.bip32ed25519;
    const schemas: KeyDerivationSchema[] = [];
    for (const path of paths) {
      const pathType = classifyPath(path);
      if (pathType === PathTypes.PATH_INVALID) {
        throw new Error('invalid path');
      }
      if (pathType === PathTypes.PATH_WALLET_SPENDING_KEY_BYRON) {
        throw new Error('byron address is not supported');
      }
      if (classifyPath(path) === PathTypes.PATH_POOL_COLD_KEY) {
        //  { path: "m/1853'/1815'/0'/x'", curve: Curve.ed25519, algo: DerivationAlgorithm.bip32ed25519, chainType: 'ADA_CIP_1853', },
        const kds = new KeyDerivationSchema(
          validBIP32PathToKeypath(
            parseBIP32Path(path, InvalidDataReason.INVALID_PATH)
          ),
          curve,
          algo,
          'ADA_CIP_1853'
        );
        schemas.push(kds);
      }
      if (
        classifyPath(path) === PathTypes.PATH_WALLET_ACCOUNT_MULTISIG ||
        classifyPath(path) === PathTypes.PATH_WALLET_SPENDING_KEY_MULTISIG ||
        classifyPath(path) === PathTypes.PATH_WALLET_STAKING_KEY_MULTISIG
      ) {
        // ADA_CIP_1854
        const kds = new KeyDerivationSchema(
          validBIP32PathToKeypath(
            parseBIP32Path(path, InvalidDataReason.INVALID_PATH)
          ),
          curve,
          algo,
          'ADA_CIP_1854'
        );
        schemas.push(kds);
      }
      // todo need add more path type support
      if (
        classifyPath(path) === PathTypes.PATH_WALLET_SPENDING_KEY_SHELLEY ||
        classifyPath(path) === PathTypes.PATH_WALLET_ACCOUNT
      ) {
        const kds = new KeyDerivationSchema(
          validBIP32PathToKeypath(
            parseBIP32Path(path, InvalidDataReason.INVALID_PATH)
          ),
          curve,
          algo,
          'ADA'
        );
        schemas.push(kds);
      }
    }
    const keyDerivation = new KeyDerivation(schemas);
    const hardwareCall = new QRHardwareCall(
      QRHardwareCallType.KeyDerivation,
      keyDerivation,
      'Keystone USB SDK',
      QRHardwareCallVersion.V1
    );
    const ur = hardwareCall.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    const account = CryptoMultiAccounts.fromCBOR(resultUR.cbor);

    const keys = account.getKeys();
    const pubkeys = keys.map((key) => key.getKey());
    const extendedPublicKeys: ExtendedPublicKey[] = [];
    for (let i = 0; i < pubkeys.length; i++) {
      extendedPublicKeys.push({
        publicKeyHex: pubkeys[i].toString('hex'),
        chainCodeHex: keys[i].getChainCode().toString('hex'),
      });
    }
    return extendedPublicKeys;
  }

  // eslint-disable-next-line max-len
  private async getHardwareCall(
    spendingPath?: ValidBIP32Path,
    stakingPath?: ValidBIP32Path
  ): Promise<CryptoMultiAccounts> {
    if (!spendingPath && !stakingPath)
      throw new Error('spendingPath or stakingPath is required');
    const curve = Curve.ed25519;
    const algo = DerivationAlgorithm.bip32ed25519;
    const keyDerivationSchemas: KeyDerivationSchema[] = [];
    if (spendingPath) {
      keyDerivationSchemas.push(
        new KeyDerivationSchema(
          validBIP32PathToKeypath(spendingPath),
          curve,
          algo,
          'ADA'
        )
      );
    }
    if (stakingPath) {
      keyDerivationSchemas.push(
        new KeyDerivationSchema(
          validBIP32PathToKeypath(stakingPath),
          curve,
          algo,
          'ADA'
        )
      );
    }
    const hardwareCall = new QRHardwareCall(
      QRHardwareCallType.KeyDerivation,
      new KeyDerivation(keyDerivationSchemas),
      'Keystone USB SDK',
      QRHardwareCallVersion.V1
    );
    const ur = hardwareCall.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    return CryptoMultiAccounts.fromCBOR(resultUR.cbor);
  }
  /**
        /**
       * Derives an address for the specified BIP 32 path.
       * Note that the address is returned in raw *hex* format without any bech32/base58 encoding
       */
  async deriveAddress({
    network,
    address,
  }: DeriveAddressRequest): Promise<DeriveAddressResponse> {
    const parsedParams = parseAddress(network, address);
    // todo check the path whether it is be supported by keystone 3 pro
    const spending = parsedParams.spendingDataSource;
    let spendingPath: ValidBIP32Path | undefined;
    let spendingScriptHash:
      | FixLenHexString<typeof SCRIPT_HASH_LENGTH>
      | undefined;
    switch (address.type) {
      case AddressType.BYRON:
        throw new Error('byron address is not supported');
      case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
      case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
      case AddressType.POINTER_KEY:
      case AddressType.ENTERPRISE_KEY:
        validate(
          spending.type === SpendingDataSourceType.PATH,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        spendingPath = (spending as SpendingDataSourcePath).path;
        break;
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
      case AddressType.POINTER_SCRIPT:
      case AddressType.ENTERPRISE_SCRIPT:
        validate(
          spending.type === SpendingDataSourceType.SCRIPT_HASH,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        spendingScriptHash = (spending as SpendingDataSourceScriptHash)
          .scriptHashHex;
        break;
      case AddressType.REWARD_KEY:
      case AddressType.REWARD_SCRIPT:
        validate(
          spending.type === SpendingDataSourceType.NONE,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        break;
      default:
        throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }

    const staking = parsedParams.stakingDataSource;
    let stakingPath: ValidBIP32Path | undefined;
    let stakingScriptHash:
      | FixLenHexString<typeof SCRIPT_HASH_LENGTH>
      | undefined;
    switch (address.type) {
      case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
      case AddressType.REWARD_KEY:
        validate(
          staking.type === StakingDataSourceType.KEY_PATH ||
            staking.type === StakingDataSourceType.KEY_HASH,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        stakingPath = (staking as StakingDataSourcePath).path;
        break;
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
      case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
      case AddressType.REWARD_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.SCRIPT_HASH,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        stakingScriptHash = (staking as StakingDataSourceScriptHash)
          .scriptHashHex;
        break;
      case AddressType.POINTER_KEY:
      case AddressType.POINTER_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.BLOCKCHAIN_POINTER,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        throw new Error('staking pointer is not supported');
        break;
      case AddressType.ENTERPRISE_KEY:
      case AddressType.ENTERPRISE_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.NONE,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );

        break;
      default:
        throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }
    // request base address
    // eslint-disable-next-line max-len
    if (
      address.type === AddressType.BASE_PAYMENT_KEY_STAKE_KEY ||
      address.type === AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT ||
      address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY ||
      address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
    ) {
      if (spendingPath && stakingPath) {
        const accounts = await this.getHardwareCall(spendingPath, stakingPath);
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, network);
        buf = Buffer.concat([buf, header]);
        for (let i = 0; i < accounts.getKeys().length; i++) {
          const pubkey = accounts.getKeys()[i].getKey();
          const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
          blake2b.update(pubkey);
          const hash = blake2b.digest();
          // must blake2b hash and then concat the hash
          buf = Buffer.concat([buf, hash]);
        }
        this.mfp = accounts.getMasterFingerprint().toString('hex');
        return {
          addressHex: buf.toString('hex'),
        };
      }

      if (spendingPath && stakingScriptHash) {
        const accounts = await this.getHardwareCall(spendingPath);
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, network);
        buf = Buffer.concat([buf, header]);
        const pubkey = accounts.getKeys()[0].getKey();
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(pubkey);
        const spendHash = blake2b.digest();
        buf = Buffer.concat([buf, spendHash]);
        buf = Buffer.concat([buf, Buffer.from(stakingScriptHash, 'hex')]);
        this.mfp = accounts.getMasterFingerprint().toString('hex');
        return {
          addressHex: buf.toString('hex'),
        };
      }

      if (spendingScriptHash && stakingPath) {
        const accounts = await this.getHardwareCall(stakingPath);
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, network);
        console.log(header);
        buf = Buffer.concat([buf, header]);
        buf = Buffer.concat([buf, Buffer.from(spendingScriptHash, 'hex')]);
        const pubkey = accounts.getKeys()[0].getKey();
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(pubkey);
        const stakeHash = blake2b.digest();
        buf = Buffer.concat([buf, stakeHash]);
        this.mfp = accounts.getMasterFingerprint().toString('hex');
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (spendingScriptHash && stakingScriptHash) {
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, network);
        buf = Buffer.concat([buf, header]);
        buf = Buffer.concat([
          buf,
          Buffer.from(spendingScriptHash, 'hex'),
          Buffer.from(stakingScriptHash, 'hex'),
        ]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
    }

    // require enterprise address AddressType.ENTERPRISE_KEY | AddressType.ENTERPRISE_SCRIPT
    if (
      address.type === AddressType.ENTERPRISE_KEY ||
      address.type === AddressType.ENTERPRISE_SCRIPT
    ) {
      if (spendingPath) {
        const accounts = await this.getHardwareCall(spendingPath);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(accounts.getKeys()[0].getKey());
        const hash = blake2b.digest();
        const header = getAddressHeader(address.type, network);
        const buf = Buffer.concat([header, hash]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (spendingScriptHash) {
        return {
          addressHex: spendingScriptHash,
        };
      }
    }
    // requre stake address
    if (
      address.type === AddressType.REWARD_KEY ||
      address.type === AddressType.REWARD_SCRIPT
    ) {
      if (stakingPath) {
        const accounts = await this.getHardwareCall(stakingPath);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(accounts.getKeys()[0].getKey());
        const hash = blake2b.digest();
        const header = getAddressHeader(address.type, network);
        const buf = Buffer.concat([header, hash]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (stakingScriptHash) {
        return {
          addressHex: stakingScriptHash,
        };
      }
    }
    throw new Error('invalid address type');
  }

  private async deriveAddressFromCache(
    address: DeviceOwnedAddress
  ): Promise<DeriveAddressResponse> {
    const parsedParams = parseAddress(Networks.Mainnet, address);
    const spending = parsedParams.spendingDataSource;
    let spendingPath: ValidBIP32Path | undefined;
    let spendingScriptHash:
      | FixLenHexString<typeof SCRIPT_HASH_LENGTH>
      | undefined;
    switch (address.type) {
      case AddressType.BYRON:
        throw new Error('byron address is not supported');
      case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
      case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
      case AddressType.POINTER_KEY:
      case AddressType.ENTERPRISE_KEY:
        validate(
          spending.type === SpendingDataSourceType.PATH,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        spendingPath = (spending as SpendingDataSourcePath).path;
        break;
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
      case AddressType.POINTER_SCRIPT:
      case AddressType.ENTERPRISE_SCRIPT:
        validate(
          spending.type === SpendingDataSourceType.SCRIPT_HASH,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        spendingScriptHash = (spending as SpendingDataSourceScriptHash)
          .scriptHashHex;
        break;
      case AddressType.REWARD_KEY:
      case AddressType.REWARD_SCRIPT:
        validate(
          spending.type === SpendingDataSourceType.NONE,
          InvalidDataReason.ADDRESS_INVALID_SPENDING_INFO
        );
        break;
      default:
        throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }

    const staking = parsedParams.stakingDataSource;
    let stakingPath: ValidBIP32Path | undefined;
    let stakingScriptHash:
      | FixLenHexString<typeof SCRIPT_HASH_LENGTH>
      | undefined;
    switch (address.type) {
      case AddressType.BASE_PAYMENT_KEY_STAKE_KEY:
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY:
      case AddressType.REWARD_KEY:
        validate(
          staking.type === StakingDataSourceType.KEY_PATH ||
            staking.type === StakingDataSourceType.KEY_HASH,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        stakingPath = (staking as StakingDataSourcePath).path;
        break;
      case AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT:
      case AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT:
      case AddressType.REWARD_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.SCRIPT_HASH,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        stakingScriptHash = (staking as StakingDataSourceScriptHash)
          .scriptHashHex;
        break;
      case AddressType.POINTER_KEY:
      case AddressType.POINTER_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.BLOCKCHAIN_POINTER,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );
        throw new Error('staking pointer is not supported');
        break;
      case AddressType.ENTERPRISE_KEY:
      case AddressType.ENTERPRISE_SCRIPT:
        validate(
          staking.type === StakingDataSourceType.NONE,
          InvalidDataReason.ADDRESS_INVALID_STAKING_INFO
        );

        break;
      default:
        throw new InvalidData(InvalidDataReason.ADDRESS_UNKNOWN_TYPE);
    }
    // request base address
    // eslint-disable-next-line max-len
    if (
      address.type === AddressType.BASE_PAYMENT_KEY_STAKE_KEY ||
      address.type === AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT ||
      address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_KEY ||
      address.type === AddressType.BASE_PAYMENT_SCRIPT_STAKE_SCRIPT
    ) {
      if (spendingPath && stakingPath) {
        const spendingPubkey = this.getPublicKeyHex(spendingPath);
        const stakingPubkey = this.getPublicKeyHex(stakingPath);
        const keys = [spendingPubkey, stakingPubkey];
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, Networks.Mainnet);
        buf = Buffer.concat([buf, header]);
        for (let i = 0; i < keys.length; i++) {
          const pubkey = keys[i];
          const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
          blake2b.update(Buffer.from(pubkey, 'hex'));
          const hash = blake2b.digest();
          // must blake2b hash and then concat the hash
          buf = Buffer.concat([buf, hash]);
        }
        return {
          addressHex: buf.toString('hex'),
        };
      }

      if (spendingPath && stakingScriptHash) {
        const spendingPubkey = this.getPublicKeyHex(spendingPath);
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, Networks.Mainnet);
        buf = Buffer.concat([buf, header]);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(Buffer.from(spendingPubkey, 'hex'));
        const spendHash = blake2b.digest();
        buf = Buffer.concat([buf, spendHash]);
        buf = Buffer.concat([buf, Buffer.from(stakingScriptHash, 'hex')]);
        return {
          addressHex: buf.toString('hex'),
        };
      }

      if (spendingScriptHash && stakingPath) {
        const stakingPubkey = this.getPublicKeyHex(stakingPath);
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, Networks.Mainnet);
        console.log(header);
        buf = Buffer.concat([buf, header]);
        buf = Buffer.concat([buf, Buffer.from(spendingScriptHash, 'hex')]);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(Buffer.from(stakingPubkey, 'hex'));
        const stakeHash = blake2b.digest();
        buf = Buffer.concat([buf, stakeHash]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (spendingScriptHash && stakingScriptHash) {
        let buf = Buffer.from([]);
        const header = getAddressHeader(address.type, Networks.Mainnet);
        buf = Buffer.concat([buf, header]);
        buf = Buffer.concat([
          buf,
          Buffer.from(spendingScriptHash, 'hex'),
          Buffer.from(stakingScriptHash, 'hex'),
        ]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
    }

    // require enterprise address AddressType.ENTERPRISE_KEY | AddressType.ENTERPRISE_SCRIPT
    if (
      address.type === AddressType.ENTERPRISE_KEY ||
      address.type === AddressType.ENTERPRISE_SCRIPT
    ) {
      if (spendingPath) {
        const accounts = await this.getHardwareCall(spendingPath);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(accounts.getKeys()[0].getKey());
        const hash = blake2b.digest();
        const header = getAddressHeader(address.type, Networks.Mainnet);
        const buf = Buffer.concat([header, hash]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (spendingScriptHash) {
        return {
          addressHex: spendingScriptHash,
        };
      }
    }
    // requre stake address
    if (
      address.type === AddressType.REWARD_KEY ||
      address.type === AddressType.REWARD_SCRIPT
    ) {
      if (stakingPath) {
        const accounts = await this.getHardwareCall(stakingPath);
        const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
        blake2b.update(accounts.getKeys()[0].getKey());
        const hash = blake2b.digest();
        const header = getAddressHeader(address.type, Networks.Mainnet);
        const buf = Buffer.concat([header, hash]);
        return {
          addressHex: buf.toString('hex'),
        };
      }
      if (stakingScriptHash) {
        return {
          addressHex: stakingScriptHash,
        };
      }
    }
    throw new Error('invalid address type');
  }

  /**
   * Notice user to check the address on the device
   * This is useful for users to check whether the wallet does not try to scam the user.
   */
  async showAddress({ network, address }: ShowAddressRequest): Promise<void> {
    const parsedParams = parseAddress(network, address);
    if (parsedParams.type === AddressType.BYRON) {
      throw new Error('Keystone 3 Pro does not support byron address');
    }
    console.log('Please check the address on the receive page of the device');
  }

  async signTransaction(
    request: SignTransactionRequest
  ): Promise<SignTransactionResponse> {
    const parsedRequest = parseSignTransactionRequest(request);
    switch (parsedRequest.signingMode) {
      case TransactionSigningMode.MULTISIG_TRANSACTION:
        throw new Error('Keystone 3 Pro does not support multisig transaction');
      default:
        break;
    }
    // send transaction to device need to get mfp first
    const { mfp } = await this.getAppConfig();
    this.mfp = mfp;
    // construct transaction ur
    const utxos: CardanoUtxoData[] = [];
    parsedRequest.tx.inputs.forEach((input, index) => {
      // todo: CardanoUtxoData is defined by keystone 3 pro , so if the input.path is not null, we need to add it to utxos
      if (input.path) {
        utxos.push({
          transactionHash: input.txHashHex,
          index: input.outputIndex,
          amount: '0',
          xfp: this.mfp ?? '',
          hdPath: validBIP32PathToKeypathString(input.path),
          address: '',
        });
      }
    });
    const cslTx = await this.convertToCSLTransaction(parsedRequest.tx);
    const serializedTx = cslTx.to_hex();
    const uniqueExtraSigners: CardanoCertKeyData[] = [];
    const extraCertSigners = this.prepareExtraSiners(
      parsedRequest.tx.certificates,
      mfp
    );
    if (parsedRequest.additionalWitnessPaths.length > 0) {
      const keyPathList = parsedRequest.additionalWitnessPaths.map((path) =>
        validBIP32PathToKeypathString(path)
      );
      keyPathList.forEach((keyPath) => {
        uniqueExtraSigners.push({
          keyHash: '',
          keyPath: keyPath,
          xfp: this.mfp ?? '',
        });
      });
    }
    uniqueExtraSigners.push(...extraCertSigners);
    const rightTx = cardanoSerialization.Transaction.from_hex(
      '83a500818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030a04818304581cdbfee4665e58c8f8e9b9ff02b17f32e08a42c855476a5d867c2737b7186da0f6'
    );
    console.log('right tx', JSON.stringify(rightTx.to_json(), null, 2));
    console.log('wrong tx', JSON.stringify(cslTx.to_json(), null, 2));
    const ur = constructSignTransactionURRequest(
      Buffer.from(serializedTx, 'hex'),
      utxos,
      uniqueExtraSigners,
      'Keystone USB SDK'
    );
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    // parse resultUr to get witnesses
    const sig = CardanoSignature.fromCBOR(resultUR.cbor);
    const witnessSet = cardanoSerialization.TransactionWitnessSet.from_bytes(
      sig.getWitnessSet()
    );
    const vkeywitnesses: cardanoSerialization.Vkeywitnesses | undefined =
      witnessSet.vkeys();
    const expectWitnesses: Witness[] = [];
    if (vkeywitnesses) {
      for (let i = 0; i < vkeywitnesses.len(); i++) {
        // todo : keystone 3 pro does not support to return path, so we need to set path to [0,0,0,0,0,0,0,0]
        expectWitnesses.push({
          path: [0, 0, 0, 0, 0, 0, 0, 0],
          witnessSignatureHex: vkeywitnesses.get(i).signature().to_hex(),
        });
      }
    }
    return {
      txHashHex: cslTx.to_hex(),
      witnesses: expectWitnesses,
      auxiliaryDataSupplement: null,
    };
  }

  async signMessage(request: SignMessageRequest): Promise<SignMessageResponse> {
    this.precheck();
    const parsedMsgData = parseMessageData(request);
    const uuidString = uuid.v4();
    const signData = parsedMsgData.messageHex;
    const hePath = validBIP32PathToKeypathString(parsedMsgData.signingPath);
    const xfp = this.mfp;
    if (!xfp) {
      throw new Error(
        'mfp not found , keystone 3 pro need xfp to identify the device'
      );
    }
    const xpub = this.getPublicKeyHex(parsedMsgData.signingPath);
    const hashPayload = parsedMsgData.hashPayload;
    const addressFieldType =
      parsedMsgData.addressFieldType === MessageAddressFieldType.ADDRESS
        ? KeystoneMessageAddressFieldType.ADDRESS
        : KeystoneMessageAddressFieldType.KEY_HASH;
    // address bench32
    const addressHex =
      request.addressFieldType === MessageAddressFieldType.ADDRESS
        ? (
            await this.deriveAddress({
              network: request.network,
              address: request.address,
            })
          ).addressHex
        : null;
    const addressBench32 = addressHex
      ? bech32_encodeAddress(Buffer.from(addressHex, 'hex'))
      : '';
    // todo : now , we need sleep 10s to close the page on the device
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const ur = CardanoSignCip8DataRequest.constructCardanoSignCip8DataRequest(
      signData,
      hePath,
      xfp,
      xpub,
      hashPayload,
      addressFieldType,
      addressBench32,
      uuidString,
      'Keystone USB SDK'
    ).toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    const result = CardanoSignCip8DataSignature.fromCBOR(resultUR.cbor);
    return {
      signatureHex: result.getSignature().toString('hex'),
      signingPublicKeyHex: result.getPublicKey().toString('hex'),
      addressFieldHex: result.getAddressField().toString('hex'),
    };
  }

  async signCIP36Vote(
    request: SignCIP36VoteRequest
  ): Promise<SignCIP36VoteResponse> {
    const parsedCVote = parseCVote(request);
    if (parsedCVote.witnessPath[0] === 1694 + HARDENED) {
      throw new Error('Keystone 3 Pro does not support 1694 path');
    }
    // construct sign cip36 vote ur
    const uuidString = uuid.v4();
    const signData = parsedCVote.voteCastDataHex;
    const hePath = validBIP32PathToKeypathString(parsedCVote.witnessPath);
    const xfp = this.mfp;
    if (!xfp) {
      throw new Error(
        'mfp not found , keystone 3 pro need xfp to identify the device'
      );
    }
    const xpub = this.getPublicKeyHex(parsedCVote.witnessPath);
    const ur = CardanoSignDataRequest.constructCardanoSignDataRequest(
      signData,
      hePath,
      xfp,
      xpub,
      uuidString,
      'Keystone USB SDK'
    ).toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    const result = CardanoSignDataSignature.fromCBOR(resultUR.cbor);
    return {
      dataHashHex: signData,
      witnessPath: request.witnessPath,
      witnessSignatureHex: result.getSignature().toString('hex'),
    };
  }

  /**
   * Derive a native script hash for the specified native script and display
   * it on Ledger in the specified format. The hash is returned in raw hex
   * format without any encoding.
   */
  async deriveNativeScriptHash({
    script,
    displayFormat,
  }: DeriveNativeScriptHashRequest): Promise<DeriveNativeScriptHashResponse> {
    parseNativeScript(script);
    parseNativeScriptHashDisplayFormat(displayFormat);

    const nativeScript: NativeScript = script;
    const cardanoNativeScript = nativeScriptToCardanoNativeScript(nativeScript);
    const policyId = cardanoNativeScript.hash();
    const scriptHashHex = policyId.to_hex();
    return {
      scriptHashHex,
    };
  }

  async signOperationalCertificate(
    request: SignOperationalCertificateRequest
  ): Promise<SignOperationalCertificateResponse> {
    const parsedOperationalCertificate = parseOperationalCertificate(request);

    // find xpub by cold key
    // op_cert_hash = Buffer.concat([kesPublicKeyHex,issueCounter,kesPeriod)
    // op_cert_hash length must be 48
    const opCertMessage = Buffer.concat([
      Buffer.from(parsedOperationalCertificate.kesPublicKeyHex, 'hex'),
      uint64_to_buf(parsedOperationalCertificate.issueCounter as Uint64_str),
      uint64_to_buf(parsedOperationalCertificate.kesPeriod as Uint64_str),
    ]).toString('hex');
    const signData = opCertMessage;
    const hdPath = validBIP32PathToKeypathString(
      parsedOperationalCertificate.coldKeyPath
    );
    const xfp = this.mfp;
    if (!xfp) {
      throw new Error(
        'mfp not found , keystone 3 pro need xfp to identify the device'
      );
    }
    const xpub = this.getPublicKeyHex(parsedOperationalCertificate.coldKeyPath);
    const uuidString = uuid.v4();
    const origin = 'Keystone USB SDK';
    const ur = await CardanoSignDataRequest.constructCardanoSignDataRequest(
      signData,
      hdPath,
      xfp,
      xpub,
      uuidString,
      origin
    ).toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    const result = CardanoSignDataSignature.fromCBOR(resultUR.cbor);
    return {
      signatureHex: result.getSignature().toString('hex'),
    };
  }

  private convertToCSLTransaction(tx: ParsedTransaction): CSLTransaction {
    const inputs: CSLTransactionInputs = CSLTransactionInputs.new();
    tx.inputs.forEach((input) => {
      inputs.add(
        CSLTransactionInput.new(
          CSLTransactionHash.from_hex(input.txHashHex),
          input.outputIndex
        )
      );
    });
    const outputs: CSLTransactionOutputs = CSLTransactionOutputs.new();
    tx.outputs.forEach((output) => {
      switch (output.destination.type) {
        case TxOutputDestinationType.THIRD_PARTY:
          {
            const cslOutput = CSLTransactionOutput.new(
              CSLAddress.from_hex(output.destination.addressHex),
              CSLValue.new(CSLBigNum.from_str(output.amount.toString()))
            );
            if (output.datum) {
              if (output.datum.type === DatumType.HASH) {
                cslOutput.set_data_hash(
                  CSLDataHash.from_hex(output.datum.datumHashHex)
                );
              } else if (output.datum.type === DatumType.INLINE) {
                cslOutput.set_plutus_data(
                  CSLPlutusData.from_hex(output.datum.datumHex)
                );
              }
            }
            if (output.referenceScriptHex) {
              const tagPrefix = 'd818';
              const dataLength = output.referenceScriptHex.length / 2;
              let bytesData;
              if (dataLength <= 23) {
                bytesData =
                  (0x40 + dataLength).toString(16) + output.referenceScriptHex;
              } else if (dataLength <= 255) {
                bytesData =
                  '58' +
                  dataLength.toString(16).padStart(2, '0') +
                  output.referenceScriptHex;
              } else if (dataLength <= 65535) {
                bytesData =
                  '59' +
                  dataLength.toString(16).padStart(4, '0') +
                  output.referenceScriptHex;
              } else {
                bytesData =
                  '5a' +
                  dataLength.toString(16).padStart(8, '0') +
                  output.referenceScriptHex;
              }
              const finalScriptRefBuf = Buffer.concat([
                Buffer.from(tagPrefix, 'hex'),
                Buffer.from(bytesData, 'hex'),
              ]);
              cslOutput.set_script_ref(
                cardanoSerialization.ScriptRef.from_bytes(finalScriptRefBuf)
              );
            }
            outputs.add(cslOutput);
          }
          break;
        case TxOutputDestinationType.DEVICE_OWNED:
          throw new Error(
            'Keystone 3 Pro does not support device owned address'
          );
        default:
          throw new Error('invalid destination type');
      }
    });
    const body: CSLTransactionBody = CSLTransactionBody.new(
      inputs,
      outputs,
      CSLBigNum.from_str(tx.fee),
      tx.ttl ? Number(tx.ttl) : undefined
    );
    const certificates: CSLCertificates = CSLCertificates.new();
    tx.certificates.forEach((certificate) => {
      switch (certificate.type) {
        case CertificateType.STAKE_DELEGATION:
          certificates.add(
            CSLCertificate.new_stake_delegation(
              this.prepareStakeDelegation(certificate)
            )
          );
          break;
        case CertificateType.STAKE_DEREGISTRATION_CONWAY:
          certificates.add(
            CSLCertificate.new_stake_registration_and_delegation(
              this.prepareStakeDeregistrationConway(certificate)
            )
          );
          break;
        case CertificateType.STAKE_DEREGISTRATION:
          certificates.add(
            CSLCertificate.new_stake_deregistration(
              this.prepareStakeDeregistration(certificate)
            )
          );
          break;
        case CertificateType.STAKE_REGISTRATION:
          certificates.add(
            CSLCertificate.new_stake_registration(
              this.prepareStakeRegistration(certificate)
            )
          );
          break;
        case CertificateType.STAKE_REGISTRATION_CONWAY:
          certificates.add(
            CSLCertificate.new_stake_registration_and_delegation(
              this.prepareStakeRegistrationConway(certificate)
            )
          );
          break;
        case CertificateType.VOTE_DELEGATION:
          certificates.add(
            CSLCertificate.new_vote_delegation(
              this.prepareVoteDelegation(certificate)
            )
          );
          break;
        case CertificateType.AUTHORIZE_COMMITTEE_HOT:
          certificates.add(
            CSLCertificate.new_committee_hot_auth(
              this.prepareAuthorizeCommitteeHot(certificate)
            )
          );
          break;
        case CertificateType.RESIGN_COMMITTEE_COLD:
          certificates.add(
            CSLCertificate.new_committee_cold_resign(
              this.prepareResignCommitteeCold(certificate)
            )
          );
          break;
        case CertificateType.DREP_REGISTRATION:
          certificates.add(
            CSLCertificate.new_drep_registration(
              this.prepareDrepRegistration(certificate)
            )
          );
          break;
        case CertificateType.DREP_DEREGISTRATION:
          certificates.add(
            CSLCertificate.new_drep_deregistration(
              this.prepareDrepDeregistration(certificate)
            )
          );
          break;
        case CertificateType.DREP_UPDATE:
          certificates.add(
            CSLCertificate.new_drep_update(this.prepareDrepUpdate(certificate))
          );
          break;
        case CertificateType.STAKE_POOL_REGISTRATION:
          certificates.add(
            CSLCertificate.new_pool_registration(
              this.prepareStakePoolRegistration(certificate)
            )
          );
          break;
        case CertificateType.STAKE_POOL_RETIREMENT:
          certificates.add(
            CSLCertificate.new_pool_retirement(
              this.prepareStakePoolRetirement(certificate)
            )
          );
          break;
      }
    });
    if (certificates.len() > 0) {
      body.set_certs(certificates);
    }
    const witness_set: CSLTransactionWitnessSet =
      CSLTransactionWitnessSet.new();
    const cslTx: CSLTransaction = CSLTransaction.new(body, witness_set);
    return cslTx;
  }

  private prepareStakePoolRetirement(certificate: {
    type: CertificateType.STAKE_POOL_RETIREMENT;
    path: ValidBIP32Path;
    retirementEpoch: Uint64_str;
  }): cardanoSerialization.PoolRetirement {
    // console.log('keys',this.pathToPublicKeyMap);
    // const extendedPublicKey = this.getExtendedPublicKey(certificate.path);
    // console.log('extendedPublicKey',extendedPublicKey.publicKeyHex);
    const blake2b = blake2.createHash('blake2b', { digestLength: 28 });
    blake2b.update(Buffer.from(this.getPublicKeyHex(certificate.path)));
    const hash = blake2b.digest();
    const addressHex = hash.toString('hex');
    const poolKeyHash =
      cardanoSerialization.Ed25519KeyHash.from_hex(addressHex);
    const poolRetirement: cardanoSerialization.PoolRetirement =
      cardanoSerialization.PoolRetirement.new(
        poolKeyHash,
        Number(certificate.retirementEpoch)
      );
    return poolRetirement;
  }

  private prepareStakePoolRegistration(certificate: {
    type: CertificateType.STAKE_POOL_REGISTRATION;
    pool: ParsedPoolParams;
  }): cardanoSerialization.PoolRegistration {
    let poolParams: cardanoSerialization.PoolParams;
    let rewardAccount: cardanoSerialization.RewardAddress | undefined;
    switch (certificate.pool.rewardAccount.type) {
      case PoolRewardAccountType.THIRD_PARTY:
        rewardAccount = cardanoSerialization.RewardAddress.from_address(
          cardanoSerialization.Address.from_hex(
            certificate.pool.rewardAccount.rewardAccountHex
          )
        );
        break;
      case PoolRewardAccountType.DEVICE_OWNED:
        rewardAccount = cardanoSerialization.RewardAddress.from_address(
          cardanoSerialization.Address.from_hex(
            this.getPublicKeyHex(certificate.pool.rewardAccount.path)
          )
        );
        break;
    }
    if (!rewardAccount) {
      throw new Error('Reward account is not set');
    }
    const owners: cardanoSerialization.Ed25519KeyHashes =
      cardanoSerialization.Ed25519KeyHashes.new();
    certificate.pool.owners.forEach((owner) => {
      if (owner.type === PoolOwnerType.THIRD_PARTY) {
        owners.add(cardanoSerialization.Ed25519KeyHash.from_hex(owner.hashHex));
      }
      if (owner.type === PoolOwnerType.DEVICE_OWNED) {
        // keystone need path to get the owner keyhash
        const pubKey = this.getPublicKeyHex(owner.path);
        owners.add(cardanoSerialization.Ed25519KeyHash.from_hex(pubKey));
      }
    });
    const relays: cardanoSerialization.Relays =
      cardanoSerialization.Relays.new();
    certificate.pool.relays.forEach((relay) => {
      if (relay.type === RelayType.SINGLE_HOST_HOSTNAME) {
        relays.add(
          cardanoSerialization.Relay.new_single_host_name(
            cardanoSerialization.SingleHostName.new(
              Number(relay.port),
              cardanoSerialization.DNSRecordAorAAAA.new(relay.dnsName)
            )
          )
        );
      } else if (relay.type === RelayType.SINGLE_HOST_IP_ADDR) {
        if (relay.ipv4) {
          relays.add(
            cardanoSerialization.Relay.new_single_host_addr(
              cardanoSerialization.SingleHostAddr.new(
                Number(relay.port),
                cardanoSerialization.Ipv4.new(Buffer.from(relay.ipv4))
              )
            )
          );
        }
        if (relay.ipv6) {
          relays.add(
            cardanoSerialization.Relay.new_single_host_addr(
              cardanoSerialization.SingleHostAddr.new(
                Number(relay.port),
                undefined,
                cardanoSerialization.Ipv6.new(Buffer.from(relay.ipv6))
              )
            )
          );
        }
        if (relay.ipv4 && relay.ipv6) {
          relays.add(
            cardanoSerialization.Relay.new_single_host_addr(
              cardanoSerialization.SingleHostAddr.new(
                Number(relay.port),
                cardanoSerialization.Ipv4.new(Buffer.from(relay.ipv4)),
                cardanoSerialization.Ipv6.new(Buffer.from(relay.ipv6))
              )
            )
          );
        }
      } else if (relay.type === RelayType.MULTI_HOST) {
        relays.add(
          cardanoSerialization.Relay.new_multi_host_name(
            cardanoSerialization.MultiHostName.new(
              cardanoSerialization.DNSRecordSRV.new(relay.dnsName)
            )
          )
        );
      }
    });
    switch (certificate.pool.poolKey.type) {
      case PoolKeyType.THIRD_PARTY:
        poolParams = cardanoSerialization.PoolParams.new(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.pool.poolKey.hashHex
          ),
          cardanoSerialization.VRFKeyHash.from_hex(certificate.pool.vrfHashHex),
          cardanoSerialization.BigNum.from_str(certificate.pool.pledge),
          cardanoSerialization.BigNum.from_str(certificate.pool.cost),
          cardanoSerialization.UnitInterval.new(
            cardanoSerialization.BigNum.from_str(
              certificate.pool.margin.numerator
            ),
            cardanoSerialization.BigNum.from_str(
              certificate.pool.margin.denominator
            )
          ),
          rewardAccount,
          owners,
          relays
        );
        break;
      case PoolKeyType.DEVICE_OWNED:
        poolParams = cardanoSerialization.PoolParams.new(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.pool.poolKey.path)
          ),
          cardanoSerialization.VRFKeyHash.from_hex(certificate.pool.vrfHashHex),
          cardanoSerialization.BigNum.from_str(certificate.pool.pledge),
          cardanoSerialization.BigNum.from_str(certificate.pool.cost),
          cardanoSerialization.UnitInterval.new(
            cardanoSerialization.BigNum.from_str(
              certificate.pool.margin.numerator
            ),
            cardanoSerialization.BigNum.from_str(
              certificate.pool.margin.denominator
            )
          ),
          rewardAccount,
          owners,
          relays
        );
    }
    const poolRegistration: cardanoSerialization.PoolRegistration =
      cardanoSerialization.PoolRegistration.new(poolParams);
    return poolRegistration;
  }

  private prepareDrepUpdate(certificate: {
    type: CertificateType.DREP_UPDATE;
    dRepCredential: ParsedCredential;
    anchor: ParsedAnchor | null;
  }): cardanoSerialization.DRepUpdate {
    let dRepCredential: cardanoSerialization.Credential;
    switch (certificate.dRepCredential.type) {
      case CredentialType.KEY_HASH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.dRepCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.dRepCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        dRepCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.dRepCredential.scriptHashHex
          )
        );
        break;
    }
    if (certificate.anchor) {
      const anchor = cardanoSerialization.Anchor.from_hex(
        certificate.anchor.hashHex
      );
      return cardanoSerialization.DRepUpdate.new_with_anchor(
        dRepCredential,
        anchor
      );
    }
    return cardanoSerialization.DRepUpdate.new(dRepCredential);
  }

  private prepareDrepDeregistration(certificate: {
    type: CertificateType.DREP_DEREGISTRATION;
    dRepCredential: ParsedCredential;
    deposit: Uint64_str;
  }): cardanoSerialization.DRepDeregistration {
    let dRepCredential: cardanoSerialization.Credential;
    switch (certificate.dRepCredential.type) {
      case CredentialType.KEY_HASH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.dRepCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.dRepCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        dRepCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.dRepCredential.scriptHashHex
          )
        );
        break;
    }
    return cardanoSerialization.DRepDeregistration.new(
      dRepCredential,
      cardanoSerialization.BigNum.from_str(certificate.deposit)
    );
  }

  private prepareDrepRegistration(certificate: {
    type: CertificateType.DREP_REGISTRATION;
    dRepCredential: ParsedCredential;
    deposit: Uint64_str;
    anchor: ParsedAnchor | null;
  }): cardanoSerialization.DRepRegistration {
    let dRepCredential: cardanoSerialization.Credential;
    switch (certificate.dRepCredential.type) {
      case CredentialType.KEY_HASH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.dRepCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        dRepCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.dRepCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        dRepCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.dRepCredential.scriptHashHex
          )
        );
        break;
    }

    if (certificate.anchor) {
      const anchor = cardanoSerialization.Anchor.from_hex(
        certificate.anchor.hashHex
      );
      return cardanoSerialization.DRepRegistration.new_with_anchor(
        dRepCredential,
        cardanoSerialization.BigNum.from_str(certificate.deposit),
        anchor
      );
    }
    return cardanoSerialization.DRepRegistration.new(
      dRepCredential,
      cardanoSerialization.BigNum.from_str(certificate.deposit)
    );
  }

  private prepareResignCommitteeCold(certificate: {
    type: CertificateType.RESIGN_COMMITTEE_COLD;
    coldCredential: ParsedCredential;
    anchor: ParsedAnchor | null;
  }): cardanoSerialization.CommitteeColdResign {
    let coldCredential: cardanoSerialization.Credential;
    switch (certificate.coldCredential.type) {
      case CredentialType.KEY_HASH:
        coldCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.coldCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        coldCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.coldCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        coldCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.coldCredential.scriptHashHex
          )
        );
        break;
    }

    if (certificate.anchor) {
      const anchor = cardanoSerialization.Anchor.from_hex(
        certificate.anchor.hashHex
      );
      return cardanoSerialization.CommitteeColdResign.new_with_anchor(
        coldCredential,
        anchor
      );
    }
    return cardanoSerialization.CommitteeColdResign.new(coldCredential);
  }

  private prepareAuthorizeCommitteeHot(certificate: {
    type: CertificateType.AUTHORIZE_COMMITTEE_HOT;
    coldCredential: ParsedCredential;
    hotCredential: ParsedCredential;
  }): cardanoSerialization.CommitteeHotAuth {
    let coldCredential: cardanoSerialization.Credential;
    switch (certificate.coldCredential.type) {
      case CredentialType.KEY_HASH:
        coldCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.coldCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        coldCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.coldCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        coldCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.coldCredential.scriptHashHex
          )
        );
        break;
    }
    let hotCredential: cardanoSerialization.Credential;
    switch (certificate.hotCredential.type) {
      case CredentialType.KEY_HASH:
        hotCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.hotCredential.keyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        hotCredential = cardanoSerialization.Credential.from_keyhash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            this.getPublicKeyHex(certificate.hotCredential.path)
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        hotCredential = cardanoSerialization.Credential.from_scripthash(
          cardanoSerialization.ScriptHash.from_hex(
            certificate.hotCredential.scriptHashHex
          )
        );
        break;
    }
    const committeeHotAuth: cardanoSerialization.CommitteeHotAuth =
      cardanoSerialization.CommitteeHotAuth.new(coldCredential, hotCredential);
    return committeeHotAuth;
  }

  private prepareVoteDelegation(certificate: {
    type: CertificateType.VOTE_DELEGATION;
    stakeCredential: ParsedCredential;
    dRep: ParsedDRep;
  }): cardanoSerialization.VoteDelegation {
    let voteDelegation: cardanoSerialization.VoteDelegation;
    let dRepCredential: cardanoSerialization.DRep;
    switch (certificate.dRep.type) {
      case DRepType.KEY_PATH:
        dRepCredential = cardanoSerialization.DRep.new_from_credential(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.dRep.path)
            )
          )
        );
        break;
      case DRepType.KEY_HASH:
        dRepCredential = cardanoSerialization.DRep.new_key_hash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.dRep.keyHashHex
          )
        );
        break;
      case DRepType.SCRIPT_HASH:
        dRepCredential = cardanoSerialization.DRep.new_script_hash(
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.dRep.scriptHashHex
          )
        );
        break;
      case DRepType.ABSTAIN:
        dRepCredential = cardanoSerialization.DRep.new_always_abstain();
        break;
      case DRepType.NO_CONFIDENCE:
        dRepCredential = cardanoSerialization.DRep.new_always_no_confidence();
        break;
    }
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        voteDelegation = cardanoSerialization.VoteDelegation.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            )
          ),
          dRepCredential
        );
        break;
      case CredentialType.KEY_PATH:
        voteDelegation = cardanoSerialization.VoteDelegation.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            )
          ),
          dRepCredential
        );
        break;
      case CredentialType.SCRIPT_HASH:
        voteDelegation = cardanoSerialization.VoteDelegation.new(
          cardanoSerialization.Credential.from_hex(
            certificate.stakeCredential.scriptHashHex
          ),
          dRepCredential
        );
        break;
    }
    return voteDelegation;
  }

  private prepareStakeRegistrationConway(certificate: {
    type: CertificateType.STAKE_REGISTRATION_CONWAY;
    stakeCredential: ParsedCredential;
    deposit: Uint64_str;
  }): cardanoSerialization.StakeRegistrationAndDelegation {
    let stakeRegistrationConway: cardanoSerialization.StakeRegistrationAndDelegation;
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        stakeRegistrationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_keyhash(
              cardanoSerialization.Ed25519KeyHash.from_hex(
                certificate.stakeCredential.keyHashHex
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
      case CredentialType.KEY_PATH:
        stakeRegistrationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_keyhash(
              cardanoSerialization.Ed25519KeyHash.from_hex(
                this.getPublicKeyHex(certificate.stakeCredential.path)
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
      case CredentialType.SCRIPT_HASH:
        stakeRegistrationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_scripthash(
              cardanoSerialization.ScriptHash.from_hex(
                certificate.stakeCredential.scriptHashHex
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.scriptHashHex
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
    }
    return stakeRegistrationConway;
  }

  private prepareStakeRegistration(certificate: {
    type: CertificateType.STAKE_REGISTRATION;
    stakeCredential: ParsedCredential;
  }): cardanoSerialization.StakeRegistration {
    let stakeRegistration: cardanoSerialization.StakeRegistration;
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        stakeRegistration = cardanoSerialization.StakeRegistration.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            )
          )
        );
        break;
      case CredentialType.KEY_PATH:
        stakeRegistration = cardanoSerialization.StakeRegistration.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            )
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        stakeRegistration = cardanoSerialization.StakeRegistration.new(
          cardanoSerialization.Credential.from_scripthash(
            cardanoSerialization.ScriptHash.from_hex(
              certificate.stakeCredential.scriptHashHex
            )
          )
        );
        break;
    }
    return stakeRegistration;
  }

  private prepareStakeDeregistration(certificate: {
    type: CertificateType.STAKE_DEREGISTRATION;
    stakeCredential: ParsedCredential;
  }): cardanoSerialization.StakeDeregistration {
    let stakeDeregistration: cardanoSerialization.StakeDeregistration;
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        stakeDeregistration = cardanoSerialization.StakeDeregistration.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            )
          )
        );
        break;
      case CredentialType.KEY_PATH:
        stakeDeregistration = cardanoSerialization.StakeDeregistration.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            )
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        stakeDeregistration = cardanoSerialization.StakeDeregistration.new(
          cardanoSerialization.Credential.from_scripthash(
            cardanoSerialization.ScriptHash.from_hex(
              certificate.stakeCredential.scriptHashHex
            )
          )
        );
        break;
    }
    return stakeDeregistration;
  }

  private prepareStakeDelegation(certificate: {
    type: CertificateType.STAKE_DELEGATION;
    stakeCredential: ParsedCredential;
    poolKeyHashHex: FixLenHexString<typeof KEY_HASH_LENGTH>;
  }): cardanoSerialization.StakeDelegation {
    let stakeDelegation: cardanoSerialization.StakeDelegation;
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        stakeDelegation = cardanoSerialization.StakeDelegation.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            )
          ),
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.poolKeyHashHex
          )
        );
        break;
      case CredentialType.KEY_PATH:
        stakeDelegation = cardanoSerialization.StakeDelegation.new(
          cardanoSerialization.Credential.from_keyhash(
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            )
          ),
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.poolKeyHashHex
          )
        );
        break;
      case CredentialType.SCRIPT_HASH:
        stakeDelegation = cardanoSerialization.StakeDelegation.new(
          cardanoSerialization.Credential.from_scripthash(
            cardanoSerialization.ScriptHash.from_hex(
              certificate.stakeCredential.scriptHashHex
            )
          ),
          cardanoSerialization.Ed25519KeyHash.from_hex(
            certificate.poolKeyHashHex
          )
        );
        break;
    }
    return stakeDelegation;
  }

  private prepareStakeDeregistrationConway(certificate: {
    type: CertificateType.STAKE_DEREGISTRATION_CONWAY;
    stakeCredential: ParsedCredential;
    deposit: Uint64_str;
  }): cardanoSerialization.StakeRegistrationAndDelegation {
    let stakeDelegationConway: cardanoSerialization.StakeRegistrationAndDelegation;
    switch (certificate.stakeCredential.type) {
      case CredentialType.KEY_HASH:
        stakeDelegationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_keyhash(
              cardanoSerialization.Ed25519KeyHash.from_hex(
                certificate.stakeCredential.keyHashHex
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.keyHashHex
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
      case CredentialType.KEY_PATH:
        stakeDelegationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_keyhash(
              cardanoSerialization.Ed25519KeyHash.from_hex(
                validBIP32PathToKeypathString(certificate.stakeCredential.path)
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              this.getPublicKeyHex(certificate.stakeCredential.path)
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
      case CredentialType.SCRIPT_HASH:
        stakeDelegationConway =
          cardanoSerialization.StakeRegistrationAndDelegation.new(
            cardanoSerialization.Credential.from_scripthash(
              cardanoSerialization.ScriptHash.from_hex(
                certificate.stakeCredential.scriptHashHex
              )
            ),
            cardanoSerialization.Ed25519KeyHash.from_hex(
              certificate.stakeCredential.scriptHashHex
            ),
            cardanoSerialization.BigNum.from_str(certificate.deposit)
          );
        break;
    }
    return stakeDelegationConway;
  }

  private prepareExtraSiners(
    certs: ParsedCertificate[],
    mfp: string
  ): CardanoCertKeyData[] {
    const keyHash = '';
    const xfp = mfp;
    const result: CardanoCertKeyData[] = [];
    certs.forEach((certificate) => {
      switch (certificate.type) {
        case CertificateType.STAKE_DELEGATION:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_DEREGISTRATION_CONWAY:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_DEREGISTRATION:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_REGISTRATION:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_REGISTRATION_CONWAY:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.VOTE_DELEGATION:
          if (certificate.stakeCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.stakeCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.AUTHORIZE_COMMITTEE_HOT:
          if (certificate.coldCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.coldCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.RESIGN_COMMITTEE_COLD:
          if (certificate.coldCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.coldCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.DREP_REGISTRATION:
          if (certificate.dRepCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.dRepCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.DREP_DEREGISTRATION:
          if (certificate.dRepCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.dRepCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.DREP_UPDATE:
          if (certificate.dRepCredential.type === CredentialType.KEY_PATH) {
            const keypath = validBIP32PathToKeypathString(
              certificate.dRepCredential.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_POOL_REGISTRATION:
          if (
            certificate.pool.rewardAccount.type ===
            PoolRewardAccountType.DEVICE_OWNED
          ) {
            const keypath = validBIP32PathToKeypathString(
              certificate.pool.rewardAccount.path
            );
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        case CertificateType.STAKE_POOL_RETIREMENT:
          if (certificate.path) {
            const keypath = validBIP32PathToKeypathString(certificate.path);
            result.push({ keyHash, xfp, keyPath: keypath });
          }
          break;
        default:
          break;
      }
    });
    // unique result
    const uniqueResult = [...new Set(result)];
    return uniqueResult;
  }
}

const parseResponoseUR = (urPlayload: string): UR => {
  const decoder = new URDecoder();
  decoder.receivePart(urPlayload);
  if (!decoder.isComplete()) {
    throwTransportError(Status.ERR_UR_INCOMPLETE);
  }
  const resultUR = decoder.resultUR();
  return resultUR;
};

const bip32PathToPathComponent = (path: BIP32Path): PathComponent[] => {
  return path.map((element) => {
    if (element >= HARDENED) {
      return new PathComponent({ index: element - HARDENED, hardened: true });
    } else {
      return new PathComponent({ index: element, hardened: false });
    }
  });
};

const validBIP32PathToKeypath = (path: ValidBIP32Path): CryptoKeypath => {
  const pathComponents = path.map((element) => {
    if (element >= HARDENED) {
      return new PathComponent({ index: element - HARDENED, hardened: true });
    } else {
      return new PathComponent({ index: element, hardened: false });
    }
  });
  return new CryptoKeypath(pathComponents);
};

const validBIP32PathToKeypathString = (path: ValidBIP32Path): string => {
  const pathComponents = path.map((element) => {
    if (element >= HARDENED) {
      return `${element - HARDENED}'`;
    } else {
      return `${element}`;
    }
  });
  return `m/${pathComponents.join('/')}`;
};

export const pathToKeypath = (path: string): CryptoKeypath => {
  const paths = path.replace(/[m|M]\//, '').split('/');
  const pathComponents = paths.map((path) => {
    const index = parseInt(path.replace('\'', ''), 10);
    const isHardened = path.endsWith('\'');
    return new PathComponent({ index, hardened: isHardened });
  });
  return new CryptoKeypath(pathComponents);
};
const nativeScriptToCardanoNativeScript = (
  nativeScript: NativeScript
): cardanoSerialization.NativeScript => {
  switch (nativeScript.type) {
    case NativeScriptType.PUBKEY_THIRD_PARTY: {
      const scriptPubkey = cardanoSerialization.ScriptPubkey.new(
        // eslint-disable-next-line no-undef
        cardanoSerialization.Ed25519KeyHash.from_bytes(
          Buffer.from(nativeScript.params.keyHashHex, 'hex')
        )
      );
      return cardanoSerialization.NativeScript.new_script_pubkey(scriptPubkey);
    }
    case NativeScriptType.ALL: {
      const nativeScripts = nativeScript.params.scripts.map((script) =>
        nativeScriptToCardanoNativeScript(script)
      );
      const nativeScriptsSet = cardanoSerialization.NativeScripts.new();
      nativeScripts.forEach((script) => nativeScriptsSet.add(script));
      const scriptAll = cardanoSerialization.ScriptAll.new(nativeScriptsSet);
      return cardanoSerialization.NativeScript.new_script_all(scriptAll);
    }

    case NativeScriptType.ANY: {
      const nativeScripts = nativeScript.params.scripts.map((script) =>
        nativeScriptToCardanoNativeScript(script)
      );
      const nativeScriptsSet = cardanoSerialization.NativeScripts.new();
      nativeScripts.forEach((script) => nativeScriptsSet.add(script));
      const scriptAny = cardanoSerialization.ScriptAny.new(nativeScriptsSet);
      return cardanoSerialization.NativeScript.new_script_any(scriptAny);
    }
    case NativeScriptType.N_OF_K: {
      const nativeScripts = nativeScript.params.scripts.map((script) =>
        nativeScriptToCardanoNativeScript(script)
      );
      const nativeScriptsSet = cardanoSerialization.NativeScripts.new();
      nativeScripts.forEach((script) => nativeScriptsSet.add(script));
      const scriptNOfK = cardanoSerialization.ScriptNOfK.new(
        nativeScript.params.requiredCount,
        nativeScriptsSet
      );
      return cardanoSerialization.NativeScript.new_script_n_of_k(scriptNOfK);
    }
    case NativeScriptType.INVALID_BEFORE: {
      const slot = cardanoSerialization.TimelockStart.new_timelockstart(
        cardanoSerialization.BigNum.from_str(
          nativeScript.params.slot.toString()
        )
      );
      return cardanoSerialization.NativeScript.new_timelock_start(slot);
    }
    case NativeScriptType.INVALID_HEREAFTER: {
      const slot = cardanoSerialization.TimelockExpiry.new_timelockexpiry(
        cardanoSerialization.BigNum.from_str(
          nativeScript.params.slot.toString()
        )
      );
      return cardanoSerialization.NativeScript.new_timelock_expiry(slot);
    }
    default:
      throw new Error('Unsupported native script type');
  }
};

const getAddressHeader = (
  addressType: AddressType,
  network: Network
): Buffer => {
  const parsedNetwork = parseNetwork(network);
  const header = Buffer.from([(addressType << 4) | parsedNetwork.networkId]);
  return header;
};

const decodeBech32PublicKey = (bech32Pubkey: string) => {
  const decoded = bech32.decode(bech32Pubkey);
  return Buffer.from(bech32.fromWords(decoded.words));
};

const constructSignTransactionURRequest = (
  signData: Buffer,
  utxos: CardanoUtxoData[],
  extraSigners: CardanoCertKeyData[],
  origin: string
): UR => {
  const requestId = uuid.v4();
  const cardanoRequest = CardanoSignRequest.constructCardanoSignRequest(
    signData,
    utxos,
    extraSigners,
    requestId,
    origin
  );
  const ur = cardanoRequest.toUR();
  console.log('ur', Buffer.from(ur.cbor).toString('hex'));
  return ur;
};

export function toHex(buf: Buffer | Uint8Array | undefined): string {
  return buf === undefined ? '' : Buffer.from(buf).toString('hex');
}
