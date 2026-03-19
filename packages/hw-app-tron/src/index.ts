import * as uuid from 'uuid';
import Base, { parseResponoseUR } from '@keystonehq/hw-app-base';
import { Actions, TransportHID } from '@keystonehq/hw-transport-usb';
import { TronSignRequest, TronSignature, DataType } from '@keystonehq/bc-ur-registry-tron';
import { UREncoder, UR } from '@ngraveio/bc-ur';

/**
 * Tron Hardware Wallet Application.
 * Extends the Base class to reuse common USB transport logic.
 */
export default class Tron extends Base {
    /**
     * Constructs a new instance of the Tron class.
     *
     * @param transport - An object of type TransportHID for USB communication.
     * @param mfp - Optional parameter for the master fingerprint of the wallet.
     */
    constructor(transport: TransportHID, mfp?: string) {
        super(transport, mfp);
    }

    /**
     * Signs a Tron transaction using the specified derivation path.
     */
    async signTransactionBuffer(path: string, rawTx: Buffer, xfp: string, origin: string, type: DataType): Promise<{ r: string, s: string, v: string }> {
        this.precheck();
        const encodedUR = this.generateSignRequest(rawTx, path, xfp || this.mfp!, origin, type);
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);

        return this.parseSignature(resultUR);
    }

    /**
     * signs a Tron transaction given the raw transaction data in hexadecimal format.
     * @param path 
     * @param rawTx 
     * @param xfp 
     * @param origin 
     * @returns 
     */
    async signTransaction(path: string, rawTx: string, xfp: string, origin: string): Promise<{ r: string, s: string, v: string }> {
        return await this.signTransactionBuffer(path, Buffer.from(rawTx, 'hex'), xfp, origin, DataType.transaction);
    }

    /**
     * signs a personal message with the given path, message, xfp, and origin.
     * @param path 
     * @param message 
     * @param xfp 
     * @param origin 
     * @returns 
     */
    async signPersonalMessage(path: string, message: string, xfp: string, origin: string): Promise<{ r: string, s: string, v: string }> {
        let messageBuffer: Buffer;
        const isHex = /^(0x)?[0-9a-fA-F]+$/.test(message) && message.length % 2 === 0;

        if (isHex) {
            const cleanHex = message.startsWith('0x') ? message.slice(2) : message;
            messageBuffer = Buffer.from(cleanHex, 'hex');
        } else {
            messageBuffer = Buffer.from(message, 'utf-8');
        }
        return await this.signTransactionBuffer(path, messageBuffer, xfp || this.mfp!, origin, DataType.personalMessage);
    }

    /**
     * Constructs a UR-encoded request for Tron signing.
     *
     * @param txBuffer - The transaction data to be signed.
     * @param path - The derivation path.
     * @param mfp - The master fingerprint of the wallet.
     * @param origin - The origin of the signing request, used for user confirmation on the device.
     * @returns A string representing the UR-encoded request in uppercase.
     */
    public generateSignRequest(txBuffer: Buffer, path: string, mfp: string, origin: string, type: DataType): string {
        const requestId = uuid.v4();
        const tronUR = TronSignRequest.constructTronRequest(
            txBuffer,
            type,
            path,
            mfp,
            requestId,
            undefined,
            origin
        );

        const ur = tronUR.toUR();
        return new UREncoder(ur, Infinity).nextPart().toUpperCase();
    }

    /**
     * Parses the UR response from the device to extract the Tron signature.
     *
     * @param ur - The result UR from the device.
     * @returns The signature string in hexadecimal format.
     */
    public parseSignature(ur: UR) {
        const signature = TronSignature.fromCBOR(ur.cbor);
        const signatureBuffer = signature.getSignature();
        const r = signatureBuffer.slice(0, 32).toString('hex');
        const s = signatureBuffer.slice(32, 64).toString('hex');
        const v = signatureBuffer.slice(64).toString('hex');
        return {
            r,
            s,
            v,
        };
    };
}

