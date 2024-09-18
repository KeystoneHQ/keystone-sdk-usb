import {
    QRHardwareCall, CryptoKeypath, PathComponent, KeyDerivation, KeyDerivationSchema, Curve,
    DerivationAlgorithm, QRHardwareCallType, CryptoMultiAccounts, QRHardwareCallVersion,
    CryptoHDKey, CryptoAccount, CryptoOutput,
} from '@keystonehq/bc-ur-registry';
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Actions, TransportWebUSB, Chain, type TransportConfig, logMethod } from '@keystonehq/hw-transport-webusb';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';

export default class Base {
    private transport: TransportWebUSB;
    public mfp: string | undefined;

    /**
     * Constructs a new instance of the class.
     *
     * @param transport - An object of type TransportWebUSB
     * @param mfp - Optional parameter of type string, default is undefined, but the mfp should exist in the signing process.
     */
    constructor(transport: TransportWebUSB, mfp?: string) {
        // Initialize Solana connection
        this.transport = transport;
        if (mfp) {
            this.mfp = mfp;
        }
    }

    precheck() {
        if (!this.transport) {
            throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
        }
        if (!this.mfp) {
            throw new Error('missing mfp for this wallet');
        }
    }

    async sendToDevice(actions: Actions, data: any): Promise<any> {
        return this.transport.send(actions, data);
    }

    async checkDeviceLockStatus(): Promise<boolean> {
        const result = await this.sendToDevice(Actions.CMD_CHECK_LOCK_STATUS, '');
        return result.payload;
    }

    // Caution: this function is designed for the existing QR based intergartion 
    // which includes UR in the application logic
    // Don't use this directly if you are doing the USB integration from scratch.
    async getURAccount(path: string, curve: Curve, algo: DerivationAlgorithm): Promise<CryptoMultiAccounts> {
        const kds = new KeyDerivationSchema(pathToKeypath(path), curve, algo, 'ETH');
        const keyDerivation = new KeyDerivation([kds]);
        const hardwareCall = new QRHardwareCall(QRHardwareCallType.KeyDerivation, keyDerivation, 'Keystone USB SDK', QRHardwareCallVersion.V1);
        const ur = hardwareCall.toUR();
        const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);

        return CryptoMultiAccounts.fromCBOR(resultUR.cbor);
    }

    // Caution: this function is designed for the existing QR based intergartion 
    // which includes UR in the application logic
    // Don't use this directly if you are doing the USB integration from scratch
    async sendURRequest(encodedUR: string): Promise<UR> {
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        return parseResponoseUR(response.payload);
    }

    async getPubkey(
        path: string,
        curve: Curve,
        algo: DerivationAlgorithm
    ): Promise<{ publicKey: string, mfp: string, chainCode: Buffer }> {

        // Send a request to the device to get the address at the specified path
        const account = await this.getURAccount(path, curve, algo);
        const key = account.getKeys()[0];
        // reset the mfp when getting the address.
        this.mfp = account.getMasterFingerprint().toString('hex');
        // the compressed public key from 
        const pubkey = key.getKey();

        return {
            publicKey: pubkey.toString('hex'),
            mfp: this.mfp,
            chainCode: key.getChainCode(),
        };
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
    async getAppConfig(): Promise<any> {
        const response = await this.sendToDevice(Actions.CMD_GET_DEVICE_VERSION, '');
        return {
            version: response['firmwareVersion'],
            mfp: response['walletMFP'],
        };
    }
}

export const pathToKeypath = (path: string, index?: number): CryptoKeypath => {
    const paths = path.replace(/[m|M]\//, '').split('/');
    const pathComponents = paths.map(path => {
        const isHardened = path.endsWith('\'');
        const _index = path.replace('\'', '');
        if (_index === 'x' || _index === 'X') {
            if (index != undefined) {
                return new PathComponent({ index: index, hardened: isHardened });
            }
            return new PathComponent({ hardened: isHardened });
        }
        return new PathComponent({ index: parseInt(_index, 10), hardened: isHardened });
    });
    return new CryptoKeypath(pathComponents);
};

export const parseResponoseUR = (urPlayload: string): UR => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();
    return resultUR;
};

export const buildCryptoAccount = (args: BuildCryptoAccountArgs): CryptoAccount => {
    const { keys, origin, note, startIndex = 0 } = args;
    return new CryptoAccount(
        Buffer.from(keys[0].mfp, 'hex'),
        keys.map((key, index) => {
            return new CryptoOutput(
                [],
                buildCryptoHDKey({
                    publicKey: key.publicKey,
                    chainCode: key.chainCode,
                    mfp: key.mfp,
                    origin: origin,
                    originIndex: startIndex + index,
                    note: note,
                })
            );
        })
    );
};

export const buildCryptoHDKey = (args: BuildCryptoHDKeyArgs): CryptoHDKey => {
    const { publicKey, chainCode, mfp, origin, children, originIndex, childIndex, note } = args;
    return new CryptoHDKey({
        isMaster: false,
        isPrivateKey: false,
        key: Buffer.from(publicKey, 'hex'),
        chainCode: Buffer.from(chainCode, 'hex'),
        origin: pathToKeypath(origin, originIndex),
        children: children ? pathToKeypath(children, childIndex) : undefined,
        parentFingerprint: Buffer.from(mfp, 'hex'),
        name: 'Keystone',
        note: note,
    });
};
