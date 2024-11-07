import * as uuid from 'uuid';
import Base, { parseResponoseUR } from '@keystonehq/hw-app-base';
import { TransportWebUSB } from '@keystonehq/hw-transport-webusb';
import { Curve, CryptoPSBT, DerivationAlgorithm, CryptoMultiAccounts } from '@keystonehq/bc-ur-registry';
import { BtcSignature, BtcSignRequest, DataType } from '@keystonehq/bc-ur-registry-btc';
import { HDKey } from '@scure/bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { PartialSignature } from './psbt';
import { UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Status, throwTransportError } from '@keystonehq/hw-transport-error';
import { TransportConfig, Actions } from '@keystonehq/hw-transport-usb';


const decodePath = (path: string) => {
    const paths = path.replace(/[m|M]\//, '').split('/');
    return paths.map(path => {
        const decodedPath = path.split('\'');
        return { pathIndex: parseInt(decodedPath[0]), hardened: decodedPath[1] ? true : false };
    });
};


enum NetworkType {
    mainnet = 0,
    testnet = 1,
}

enum ScriptType {
    p2pkh = 44,   // 44
    p2sh = 49,    // 49
    p2wpkh = 84,  // 84
    p2tr = 86,   // 86
}

const VersionMap = {
    [NetworkType.mainnet]: {
        [ScriptType.p2pkh]: {
            private: 0x0488ADE4,
            public: 0x0488b21e,
        },
        [ScriptType.p2sh]: {
            private: 0x049d7878,
            public: 0x049d7cb2,
        },
        [ScriptType.p2wpkh]: {
            private: 0x04b2430c,
            public: 0x04b24746,
        },
        [ScriptType.p2tr]: {
            private: 0x0488ADE4,
            public: 0x0488b21e,
        },
    },
    [NetworkType.testnet]: {
        [ScriptType.p2pkh]: {
            private: 0x04358394,
            public: 0x043587cf,
        },
        [ScriptType.p2sh]: {
            private: 0x044a4e28,
            public: 0x044a5262,
        },
        [ScriptType.p2wpkh]: {
            private: 0x045f18bc,
            public: 0x045f1cf6,
        },
        [ScriptType.p2tr]: {
            private: 0x04358394,
            public: 0x043587cf,
        },
    },
};


const getVersion = (purpose: number, coinType: number) => {
    const networkType = coinType === 0 ? NetworkType.mainnet : NetworkType.testnet;
    const scriptType = {
        [ScriptType.p2pkh]: ScriptType.p2pkh,
        [ScriptType.p2sh]: ScriptType.p2sh,
        [ScriptType.p2wpkh]: ScriptType.p2wpkh,
        [ScriptType.p2tr]: ScriptType.p2tr,
    }[purpose] || null;

    if (scriptType === null) {
        throw new Error('Invalid purpose');
    }

    return VersionMap[networkType][scriptType];
};



class Bitcoin extends Base {
    /**
     * Constructs a new instance of the class.
     *
     * @param transport - An object of type TransportWebUSB
     * @param mfp - Optional parameter of type string, default is undefined, but the mfp should exist in the signing process.
     */
    constructor(transport: TransportWebUSB, mfp?: string) {
        // Initialize transport connection
        super(transport, mfp);
    }

    static async createWithUSBTransport(
        config?: TransportConfig,
    ): Promise<Bitcoin> {
        await TransportWebUSB.requestPermission();
        const transport = await TransportWebUSB.connect(config);
        await transport.close();
        return new Bitcoin(transport);
    }

    async getExtendedPublicKey(path: string, display = true): Promise<string> {
        // decode path
        const pathArray = decodePath(path);
        // check if path is valid
        if (pathArray.length <= 0) {
            throw new Error('Invalid path');
        }

        // get coin index
        const purpopse = pathArray[0].pathIndex;
        const coinType = pathArray[1].pathIndex;
        if (purpopse != 44 && purpopse != 49 && purpopse !== 84 && purpopse !== 86 && purpopse !== 1) {
            throw new Error('Invalid coin index');
        }

        if (coinType != 0 && coinType != 1) {
            throw new Error('Invalid coin type');
        }

        const version = getVersion(purpopse, coinType);

        const account: CryptoMultiAccounts = await this.getURAccount(path, Curve.secp256k1, DerivationAlgorithm.slip10);
        const key = account.getKeys()[0];
        const pubkey = key.getKey();
        const chainCode = key.getChainCode();

        const hdkey = new HDKey({
            publicKey: pubkey,
            chainCode: chainCode,
            versions: version,
        });
        this.mfp = account.getMasterFingerprint().toString('hex');
        return hdkey.publicExtendedKey;
    }

    /**
     * Signs a Partially Signed Bitcoin Transaction (PSBT) Ledger style.
     *
     * @param psbt - The PSBT to be signed, either as a base64 string or a Buffer.
     * @returns A promise that resolves to the signed PSBT as a string.
     * @throws Will throw an error if the PSBT is invalid or if the signing process fails.
     * @caution This function is to provide a Ledger style signing for the PSBT, For mulitsig Tx,
     * it should not be the rotation psbt which will have mutiple signature for one input
     * the cordorator should send the same psbt to each signer and collect the result
     */
    async signPsbt(psbt: string | Buffer): Promise<[number, PartialSignature][]> {
        const signedPsbtB64 = await this.signPsbtRaw(psbt);
        const psbtObj = bitcoin.Psbt.fromBase64(signedPsbtB64);

        return psbtObj.data.inputs.map((input, index) => {
            const inputIndex = index;

            // caution: the partialSig will just using the first one for each input
            // this is for single signing case, for multisig,
            // the cordorator should send the same psbt to each signer 
            if (input.partialSig && input.partialSig.length > 0) {
                const partialSignature = input.partialSig[0];
                const pubkey = partialSignature.pubkey;
                const signature = partialSignature.signature;

                if (input.tapBip32Derivation && input.tapBip32Derivation.length > 0) {
                    const tapLeafHash = input.tapBip32Derivation[0].leafHashes;
                    if (tapLeafHash.length > 0) {
                        return [
                            Number(inputIndex),
                            new PartialSignature(
                                Buffer.from(pubkey),
                                Buffer.from(signature),
                                Buffer.from(tapLeafHash[0])),
                        ];
                    }
                }

                return [Number(inputIndex), new PartialSignature(Buffer.from(pubkey), Buffer.from(signature))];
            }

            if (input.tapKeySig) {
                const pubkey = input.tapInternalKey;
                const signature = input.tapKeySig;

                return [inputIndex, new PartialSignature(
                    Buffer.from(pubkey!),
                    Buffer.from(signature)
                )];
            }

            throw new Error('No signature found for input ' + inputIndex);
        }).filter(it => it) as [number, PartialSignature][];

    }

    /**
     * Signs a Partially Signed Bitcoin Transaction (PSBT) raw.
     * @param psbt - The PSBT to be signed, either as a base64 string or a Buffer.
     * @returns A promise that resolves to the signed PSBT as a Base64string.
     * @throws Will throw an error if the PSBT is invalid or if the signing process fails.
     * @caution This function provide much more flexiblity for caller to handle the signed psbt
     */
    async signPsbtRaw(psbt: string | Buffer): Promise<string> {
        if (typeof psbt === 'string') {
            psbt = Buffer.from(psbt, 'base64');
        }
        const psbtObj = bitcoin.Psbt.fromBuffer(psbt);
        const psbtUR = new CryptoPSBT(Buffer.from(psbtObj.toBuffer())).toUR();
        const encodedUR = new UREncoder(psbtUR, Infinity).nextPart().toUpperCase();
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        const resultUR = parseResponoseUR(response.payload);
        const signedPsbt = CryptoPSBT.fromCBOR(resultUR.cbor).getPSBT();
        return signedPsbt.toString('base64');
    }

    /**
     * Retrieves the master fingerprint of the wallet.
     * @returns A promise that resolves to the master fingerprint as a string.
     * @throws Will throw an error if the device communication fails or if the response cannot be parsed
     */
    async getMasterFingerprint(): Promise<string> {
        const result = await this.getAppConfig();
        return result.mfp;
    }

    setMasterFingerprint(mfp: string): void {
        this.mfp = mfp;
    }

    /**
       * Signs a message using the legacy Bitcoin Message Signing standard. The signed message is
       * the double-sha256 hash of the concatenation of:
       * - "\x18Bitcoin Signed Message:\n";
       * - the length of `message`, encoded as a Bitcoin-style variable length integer;
       * - `message`.
       *
       * @param message the serialized message to sign
       * @param path the BIP-32 path of the key used to sign the message
       * @returns base64-encoded signature of the message.
       */
    async signMessage(message: string, path: string): Promise<string> {
        this.precheck();
        const messageBuffer = Buffer.from(message, 'utf8');
        const encodedUR = constructURRequest(messageBuffer, path, this.mfp as string, DataType.message);
        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
        return parseSignatureFromURPayload(response.payload);
    }

}

function constructURRequest(messageBuffer: Buffer, path: string, mfp: string, type: DataType): string {
    const requestId = uuid.v4();
    const xfps = [mfp];
    const paths = [path];
    const cosmosUR = BtcSignRequest.constructBtcRequest(
        requestId,
        xfps,
        messageBuffer,
        type,
        paths
    );

    const ur = cosmosUR.toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    return encodedUR;
}


const parseSignatureFromURPayload = (urPlayload: string) => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();

    const signature = BtcSignature.fromCBOR(resultUR.cbor);
    const signatureBuffer = signature.getSignature();
    return signatureBuffer.toString('base64');
};


export default Bitcoin;
