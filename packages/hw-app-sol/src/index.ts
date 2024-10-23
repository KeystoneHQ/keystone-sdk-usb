import * as uuid from 'uuid';
import {
    QRHardwareCall, CryptoKeypath, PathComponent, KeyDerivation, KeyDerivationSchema, Curve,
    DerivationAlgorithm, QRHardwareCallType, CryptoMultiAccounts, QRHardwareCallVersion,
} from '@keystonehq/bc-ur-registry';
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Actions, TransportHID } from '@keystonehq/hw-transport-usb';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';
import { SignType, SolSignRequest, SolSignature } from '@keystonehq/bc-ur-registry-sol';


const pathToKeypath = (path: string): CryptoKeypath => {
    const paths = path.replace(/[m|M]\//, '').split('/');
    const pathComponents = paths.map(path => {
        const index = parseInt(path.replace('\'', ''), 10);
        const isHardened = path.endsWith('\'');
        return new PathComponent({ index, hardened: isHardened });
    });
    return new CryptoKeypath(pathComponents);
};

export default class Solana {
    private transport: TransportHID;
    private mfp: string | undefined;

    /**
     * Constructs a new instance of the class.
     *
     * @param transport - An object of type TransportWebUSB
     * @param mfp - Optional parameter of type string, default is undefined, but the mfp should exist in the signing process.
     */
    constructor(transport: TransportHID, mfp?: string) {
        // Initialize Solana connection
        this.transport = transport;
        if (mfp) {
            this.mfp = mfp;
        }
    }

    private precheck() {
        if (!this.transport) {
            throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
        }
        if (!this.mfp) {
            throw new Error('missing mfp for this wallet');
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
    * Retrieves the public key (address) for a given derivation path from the hardware device.
    * 
    * This method sends a request to the connected hardware device to derive the public key
    * for the specified path using the ED25519 curve and SLIP-10 derivation algorithm.
    * It also updates the master fingerprint (mfp) of the instance.
    *
    * @param path - The derivation path for the desired public key, e.g., "m/44'/501'/0'"
    * @param dislay - A boolean flag to indicate whether to display the address on the device (not used in current implementation due to compitable with ledger js sdk)
    * @returns A Promise that resolves to an object containing:
    *          - address: A Buffer containing the derived public key
    *          - mfp: A string representing the master fingerprint of the wallet
    * @throws Will throw an error if the device communication fails or if the response is incomplete
    * 
    * @example
    * solana.getAddress("44'/501'/0'").then(r => r.address)
    */
    async getAddress(path: string, dislay = false): Promise<{ address: Buffer, mfp: string }> {

        // Send a request to the device to get the address at the specified path
        const curve = Curve.ed25519;
        const algo = DerivationAlgorithm.slip10;
        const kds = new KeyDerivationSchema(pathToKeypath(path), curve, algo, 'SOL');
        const keyDerivation = new KeyDerivation([kds]);
        const hardwareCall = new QRHardwareCall(QRHardwareCallType.KeyDerivation, keyDerivation, 'Keystone USB SDK', QRHardwareCallVersion.V1);
        const ur = hardwareCall.toUR();
        const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);

        const account = CryptoMultiAccounts.fromCBOR(resultUR.cbor);

        const key = account.getKeys()[0];
        // reset the mfp when getting the address.
        this.mfp = account.getMasterFingerprint().toString('hex');
        const pubkey = key.getKey();

        return {
            address: pubkey,
            mfp: this.mfp,
        };
    }

    private async sign(path: string, data: Buffer, type: SignType): Promise<{ signature: Buffer }> {
        this.precheck();
        const encodedUR = constructURRequest(data, path, this.mfp!, type);
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);

        return {
            signature: parseSignatureUR(resultUR),
        };
    }

    /**
    * Signs a Solana transaction using the specified derivation path.
    * 
    * This method sends the transaction to the hardware device for signing using the private key
    * derived from the given path.
    *
    * @param path - The derivation path of the private key to use for signing, e.g., "m/44'/501'/0'/0'"
    * @param txBuffer - A Buffer containing the serialized transaction to be signed
    * @returns A Promise that resolves to an object containing:
    *          - signature: A Buffer containing the transaction signature
    * @throws Will throw an error if the signing process fails or if the device is not properly initialized 
    * @example
    * solana.signTransaction("44'/501'/0'", txBuffer).then(r => r.signature)
    */
    async signTransaction(path: string, txBuffer: Buffer): Promise<{ signature: Buffer }> {
        return this.sign(path, txBuffer, SignType.Transaction);
    }

    /**
    * Signs an off-chain message using the specified derivation path.
    * 
    * This method sends the message to the hardware device for signing using the private key
    * derived from the given path.
    *
    * @param path - The derivation path of the private key to use for signing, e.g., "m/44'/501'/0'"
    * @param msgBuffer - A Buffer containing the off-chain message to be signed
    * @returns A Promise that resolves to an object containing:
    *          - signature: A Buffer containing the message signature
    * @throws Will throw an error if the signing process fails or if the device is not properly initialized
    */
    async signOffchainMessage(path: string, msgBuffer: Buffer): Promise<{ signature: Buffer }> {
        return this.sign(path, msgBuffer, SignType.Message);
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
        const result = response.payload;
        const appConfig = JSON.parse(result);
        return {
            version: appConfig['firmwareVersion'],
            mfp: appConfig['walletMFP'],
        };
    }
}


const constructURRequest = (txBuffer: Buffer, path: string, mfp: string, type: SignType): string => {
    const requestId = uuid.v4();
    const solRequest = SolSignRequest.constructSOLRequest(
        txBuffer,
        path,
        mfp!,
        type,
        requestId
    );
    const ur = solRequest.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    return encodedUR;
};

const parseResponoseUR = (urPlayload: string): UR => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();
    return resultUR;
};


const parseSignatureUR = (ur: UR) => {
    const signature = SolSignature.fromCBOR(ur.cbor);
    return signature.getSignature();
};



