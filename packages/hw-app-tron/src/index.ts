import * as uuid from 'uuid';
import Base, { parseResponoseUR } from '@keystonehq/hw-app-base';
import { Actions, TransportHID } from '@keystonehq/hw-transport-usb';
import { TronSignRequest, TronSignature } from '@keystonehq/bc-ur-registry-tron';
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
    async signTransactionBuffer(path: string, rawTx: Buffer, xfp: string, origin: string): Promise<string> {
        this.precheck();
        const encodedUR = this.generateSignRequest(rawTx, path, xfp || this.mfp!, origin);
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
    async signTransaction(path: string, rawTx: string, xfp: string, origin: string): Promise<string> {
        return await this.signTransactionBuffer(path, Buffer.from(rawTx, 'hex'), xfp, origin);
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
    public generateSignRequest(txBuffer: Buffer, path: string, mfp: string, origin: string): string {
        const requestId = uuid.v4();
        const tronUR = TronSignRequest.constructTronRequest(
            txBuffer,
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
    public parseSignature(ur: UR): string {
        const signature = TronSignature.fromCBOR(ur.cbor);
        return signature.getSignature().toString('hex');
    };
}

