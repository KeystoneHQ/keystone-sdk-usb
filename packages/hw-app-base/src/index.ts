import {
    QRHardwareCall, CryptoKeypath, PathComponent, KeyDerivation, KeyDerivationSchema, Curve,
    DerivationAlgorithm, QRHardwareCallType, CryptoMultiAccounts, QRHardwareCallVersion
} from '@keystonehq/bc-ur-registry'
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Actions, TransportWebUSB, Chain, type TransportConfig, logMethod } from '@keystonehq/hw-transport-webusb';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';


export const pathToKeypath = (path: string): CryptoKeypath => {
    const paths = path.replace(/[m|M]\//, '').split('/')
    const pathComponents = paths.map(path => {
        const index = parseInt(path.replace("'", ''), 10)
        const isHardened = path.endsWith("'")
        return new PathComponent({ index, hardened: isHardened })
    })
    return new CryptoKeypath(pathComponents)
}

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
            throw new Error("missing mfp for this wallet");
        }
    }

    async sendToDevice(actions: Actions, data: any): Promise<any> {
        return this.transport.send(actions, data);
    }

    async checkDeviceLockStatus(): Promise<boolean> {
        let result = await this.sendToDevice(Actions.CMD_CHECK_LOCK_STATUS, '');
        return result.payload;
    }


    async getURAccount(path: string, curve: Curve, algo: DerivationAlgorithm): Promise<CryptoMultiAccounts> {
        const kds = new KeyDerivationSchema(pathToKeypath(path), curve, algo, "ETH")
        const keyDerivation = new KeyDerivation([kds])
        const hardwareCall = new QRHardwareCall(QRHardwareCallType.KeyDerivation, keyDerivation, "Keystone USB SDK", QRHardwareCallVersion.V1);
        let ur = hardwareCall.toUR();
        const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        let resultUR = parseResponoseUR(response.payload);

        return CryptoMultiAccounts.fromCBOR(resultUR.cbor);
    }


    async sendURRequest(encodedUR: string): Promise<UR> {
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        return parseResponoseUR(response.payload);
    }

    async getPubkey(path: string, curve: Curve, algo: DerivationAlgorithm): Promise<{ publicKey: string, mfp: string, chainCode: Buffer }> {

        // Send a request to the device to get the address at the specified path
        const account = await this.getURAccount(path, curve, algo);
        let key = account.getKeys()[0];
        // reset the mfp when getting the address.
        this.mfp = account.getMasterFingerprint().toString('hex');
        // the compressed public key from 
        const pubkey = key.getKey();

        return {
            publicKey: pubkey.toString('hex'),
            mfp: this.mfp,
            chainCode: key.getChainCode()
        }
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
        let response = await this.sendToDevice(Actions.CMD_GET_DEVICE_VERSION, '');
        let result = response.payload
        let appConfig = JSON.parse(result);
        return {
            version: appConfig['firmwareVersion'],
            mfp: appConfig['walletMFP']
        }
    }
}


export const parseResponoseUR = (urPlayload: string): UR => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();
    return resultUR;
}

