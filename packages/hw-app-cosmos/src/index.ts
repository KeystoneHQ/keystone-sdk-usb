import * as uuid from 'uuid';
import Base, { parseResponoseUR } from '@keystonehq/hw-app-base';
import { Actions, TransportUsbDriver } from '@keystonehq/hw-transport-usb';
import { Curve, DerivationAlgorithm } from '@keystonehq/bc-ur-registry';
import { CosmosSignRequest, CosmosSignature, SignDataType as DataType } from '@keystonehq/bc-ur-registry-cosmos';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { bech32 } from 'bech32';
import { UREncoder, UR } from '@ngraveio/bc-ur';

export interface ResponseAddress {
    bech32_address: string;
    compressed_pk: string;
    mfp: string;
}

export enum TxDataType {
    amino = 'amino',
    json = 'json',
}

export default class Cosmos extends Base {
    /**
     * Constructs a new instance of the class.
     *
     * @param transport - An object of type TransportWebUSB
     * @param mfp - Optional parameter of type string, default is undefined, but the mfp should exist in the signing process.
     */
    constructor(transport: TransportUsbDriver, mfp?: string) {
        // Initialize Solana connection
        super(transport, mfp);
    }

    /**
     * Retrieves the public key and master fingerprint for a given Cosmos account.
     * 
     * This method constructs a BIP44 derivation path for Cosmos (coin type 118) using the provided
     * account, change, and address index parameters. It then uses this path to derive the public key
     * using the secp256k1 curve and SLIP-0010 derivation algorithm.
     *
     * @param account - The account number in the derivation path.
     * @param change - The change value in the derivation path (typically 0 for external, 1 for internal).
     * @param addressIndex - The address index in the derivation path.
     * @returns A Promise that resolves to an object containing:
     *          - publicKey: A string representing the derived public key in hexadecimal format.
     *          - mfp: A string representing the master fingerprint of the wallet.
     * @throws Will throw an error if the device is not properly set up or if the derivation fails.
     */
    async getPublicKey(
        account: number,
        change: number,
        addressIndex: number): Promise<{
            publicKey: string,
            mfp: string
        }> {
        this.precheck();
        const path = `M/44'/118'/${account}'/${change}/${addressIndex}`;
        const { publicKey, mfp } = await this.getPubkey(path, Curve.secp256k1, DerivationAlgorithm.slip10);
        return {
            publicKey,
            mfp,
        };
    }

    /**
     * Retrieves the public key for a given derivation path.
     * 
     * This method uses the SLIP-0010 derivation algorithm with the secp256k1 curve
     * to derive the public key for the specified path.
     *
     * @param path - The derivation path for the desired public key.
     * @returns A Promise that resolves to an object containing:
     *          - publicKey: A string representing the derived public key in hexadecimal format.
     *          - mfp: A string representing the master fingerprint of the wallet.
     * @throws Will throw an error if the device communication fails or if the derivation is unsuccessful.
     */
    async publicKey(
        path: string
    ): Promise<{
        publicKey: string,
        mfp: string;
    }> {
        const { publicKey, mfp } = await this.getPubkey(path, Curve.secp256k1, DerivationAlgorithm.slip10);
        return {
            publicKey,
            mfp,
        };
    }

    /**
     * Retrieves the Cosmos address and public key for a given human-readable part (HRP) and derivation path.
     *
     * This method derives the public key using the SLIP-0010 derivation algorithm with the secp256k1 curve,
     * and then generates the corresponding Cosmos bech32 address.
     *
     * @param hrp - The human-readable part of the bech32 address (e.g., 'cosmos', 'osmo', etc.)
     * @param path - The derivation path for the desired public key
     * @returns A Promise that resolves to an object containing:
     *          - bech32_address: A string representing the Cosmos bech32 address
     *          - compressed_pk: A string representing the compressed public key in hexadecimal format
     * @throws Will throw an error if the device communication fails or if the derivation is unsuccessful
     */
    async getAddressAndPubKey(hrp: string, path: string): Promise<ResponseAddress> {
        const { publicKey, mfp } = await this.getPubkey(path, Curve.secp256k1, DerivationAlgorithm.slip10);
        const bech32_address = getBech32AddressFromPublicKey(hrp, publicKey);
        return {
            bech32_address,
            compressed_pk: publicKey,
            mfp,
        };
    }


    async sign(path: string, data: Buffer, txType: TxDataType = TxDataType.amino): Promise<{
        signature: string;
    }> {
        this.precheck();
        let encodedUR = '';
        if (txType == TxDataType.amino) {
            encodedUR = constructURRequest(data, path, this.mfp!, DataType.amino);
        } else {
            encodedUR = constructURRequest(data, path, this.mfp!, DataType.direct);
        }
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);
        return {
            signature: parseSignatureUR(resultUR),
        };
    }
}


function constructURRequest(txBuffer: Buffer, path: string, mfp: string, type: DataType): string {
    const requestId = uuid.v4();
    const xfps = [mfp];
    const paths = [path];
    const cosmosUR = CosmosSignRequest.constructCosmosRequest(
        requestId,
        xfps,
        txBuffer,
        type,
        paths
    );

    const ur = cosmosUR.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    return encodedUR;
}


const parseSignatureUR = (ur: UR) => {
    const signature = CosmosSignature.fromCBOR(ur.cbor);
    const signatureBuffer = signature.getSignature();
    return signatureBuffer.toString('hex');
};


function getBech32AddressFromPublicKey(hrp: string, publicKey: string): string {
    // Decode the hex-encoded public key
    const pubKeyBuffer = Buffer.from(publicKey, 'hex');

    // Perform SHA256 hash
    const sha256Hash = sha256.create().update(pubKeyBuffer).digest();

    // Perform RIPEMD160 hash on the result of SHA256
    const ripemd160Hash = ripemd160.create().update(sha256Hash).digest();

    // Encode the RIPEMD160 hash to bech32 address
    return bech32.encode(hrp, bech32.toWords(ripemd160Hash));
}    
