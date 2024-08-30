

import * as uuid from 'uuid';
import {
    QRHardwareCall, CryptoKeypath, PathComponent, KeyDerivation, KeyDerivationSchema, Curve,
    DerivationAlgorithm, QRHardwareCallType, CryptoMultiAccounts, QRHardwareCallVersion
} from '@keystonehq/bc-ur-registry'
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Actions, TransportWebUSB, Chain, type TransportConfig, logMethod } from '@keystonehq/hw-transport-webusb';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';
import { ETHSignature, EthSignRequest, DataType } from '@keystonehq/bc-ur-registry-eth'
import { Address } from '@ethereumjs/util';
import { convertCompresskey } from './util';


const pathToKeypath = (path: string): CryptoKeypath => {
    const paths = path.replace(/[m|M]\//, '').split('/')
    const pathComponents = paths.map(path => {
        const index = parseInt(path.replace("'", ''), 10)
        const isHardened = path.endsWith("'")
        return new PathComponent({ index, hardened: isHardened })
    })
    return new CryptoKeypath(pathComponents)
}

export default class Eth {
    private transport: TransportWebUSB;
    private mfp: string | undefined;

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

    private precheck() {
        if (!this.transport) {
            throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
        }
        if (!this.mfp) {
            throw new Error("missing mfp for this wallet");
        }
    }

    private async sendToDevice(actions: Actions, data: any): Promise<any> {
        return this.transport.send(actions, data);
    }

    private async checkDeviceLockStatus(): Promise<boolean> {
        let result = await this.sendToDevice(Actions.CMD_CHECK_LOCK_STATUS, '');
        return result.payload;
    }

    /**
     * Retrieves the Ethereum address and related information based on the specified path
     *
     * @param path - The derivation path for the address
     * @param boolDisplay - A boolean indicating whether to display the QR code (default: false)
     * @param boolChainCode - A boolean indicating whether to include the chain code (default: undefined)
     * @param chainId - The ID of the Ethereum chain (default: undefined)
     * @returns A Promise object containing the address, public key, master fingerprint, and optionally the chain code
     */
    async getAddress(path: string, boolDisplay: boolean = false, boolChainCode?: boolean, chainId?: string): Promise<{ address: string, publicKey: string, mfp: string, chainCode?: string; }> {

        // Send a request to the device to get the address at the specified path
        const curve = Curve.secp256k1;
        const algo = DerivationAlgorithm.slip10
        
        const kds = new KeyDerivationSchema(pathToKeypath(path), curve, algo, "ETH")
        const keyDerivation = new KeyDerivation([kds])
        const hardwareCall = new QRHardwareCall(QRHardwareCallType.KeyDerivation, keyDerivation, "Keystone USB SDK", QRHardwareCallVersion.V1);
        let ur = hardwareCall.toUR();
        const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        let resultUR = parseResponoseUR(response.payload);

        let account = CryptoMultiAccounts.fromCBOR(resultUR.cbor);

        let key = account.getKeys()[0];
        // reset the mfp when getting the address.
        this.mfp = account.getMasterFingerprint().toString('hex');
        // the compressed public key from 
        const pubkey = key.getKey();

        const chainCode = key.getChainCode();

        const uncompressedPubkey = convertCompresskey(pubkey.toString('hex'));
        const keyBuffer = Buffer.from(uncompressedPubkey, 'hex').slice(1);
        const ethAddress = Address.fromPublicKey(keyBuffer).toString();

        return {
            address: ethAddress,
            publicKey: uncompressedPubkey,
            chainCode: boolChainCode ? chainCode.toString('hex') : undefined,
            mfp: this.mfp,
        }
    }

    private async sign(path: string, data: Buffer, type: DataType): Promise<{ r: string, s:string, v:string }> {
        this.precheck();
        const encodedUR = constructURRequest(data, path, this.mfp!, type);
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        let resultUR = parseResponoseUR(response.payload);
        return parseSignatureUR(resultUR);
    }

    /**
     * Sign a transaction using a specific path and raw transaction data
     *
     * @param path - The derivation path for the private key
     * @param rawTxHex - The raw transaction data in hexadecimal format
     * @param isLegacy - A boolean indicating whether the transaction is of the legacy type (default: false)
     * @returns A Promise object containing the signature data (r, s, v)
     * @throws Error if unable to sign the transaction
     */
    async signTransaction(path: string, rawTxHex: string, isLegacy: boolean = false): Promise<{ r: string, s:string, v:string }> {
        const txBuffer = Buffer.from(rawTxHex, 'hex');
        if(isLegacy) {
            return this.sign(path, txBuffer, DataType.transaction);
        }
        return this.sign(path, txBuffer, DataType.typedTransaction);
    }


    /**
     * Signs an EIP-712 message using a specific path and the JSON representation of the message.
     *
     * This function takes a derivation path and a JSON object representing the message, and returns
     * a Promise that resolves to an object containing the signature values (r, s, and v).
     *
     * @param path - The derivation path for the private key used to sign the message.
     * @param jsonMessage - A JavaScript object that represents the message to be signed.
     * This object should be structured according to the format required by EIP-712.
     * @return A Promise that resolves to an object with properties:
     *         - r: A string representing the "r" value of the signature.
     *         - s: A string representing the "s" value of the signature.
     *         - v: A string representing the "v" value of the signature.
     *
    */
    async signEIP712Message(path: string, jsonMessage: Object): Promise<{ r: string, s:string, v:string }> {
        const messageBuffer = Buffer.from(JSON.stringify(jsonMessage), 'utf-8');
        return this.sign(path, messageBuffer, DataType.typedData);
    }


    /**
     * Sign a personal message using a specific path and message content in hexadecimal format.
     *
     * This function takes a derivation path and a message represented by a hexadecimal string,
     * and returns a Promise that resolves to an object containing the signature values (r, s, v).
     *
     * @param path - The derivation path for the private key used to sign the message.
     * @param messageHex - A hexadecimal string that represents the message to be signed.
     * @return A Promise that resolves to an object with properties:
     *         - r: A string representing the "r" value of the signature.
     *         - s: A string representing the "s" value of the signature.
     *         - v: A string representing the "v" value of the signature.
     */
    async signPersonalMessage(path: string, messageHex: string): Promise<{ r: string, s: string, v: string }> {
        const messageBuffer = Buffer.from(messageHex, "utf-8");
        return this.sign(path, messageBuffer, DataType.personalMessage);
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


const constructURRequest = (txBuffer: Buffer, path: string, mfp: string, type: DataType): string => {
    const requestId = uuid.v4();
    let urRequest = EthSignRequest.constructETHRequest(
        txBuffer,
        type,
        path,
        mfp!,
        requestId
    );
    const ur = urRequest.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    return encodedUR;
}

const parseResponoseUR = (urPlayload: string): UR => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();
    return resultUR;
}


const parseSignatureUR = (ur: UR) => {
    let signature = ETHSignature.fromCBOR(ur.cbor)
    let signatureBuffer = signature.getSignature();
    const r = signatureBuffer.slice(0, 32).toString('hex');
    const s = signatureBuffer.slice(32, 64).toString('hex');;
    const v = signatureBuffer.slice(64).toString('hex');;
    return {
        r,
        s,
        v
    }
}



