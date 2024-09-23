/**
 * This class represents a partial signature produced by the app during signing.
 * It always contains the `signature` and the corresponding `pubkey` whose private key
 * was used for signing; in the case of taproot script paths, it also contains the
 * tapleaf hash.
 */

export class PartialSignature {
    readonly pubkey: Buffer;
    readonly signature: Buffer;
    readonly tapleafHash?: Buffer;

    constructor(pubkey: Buffer, signature: Buffer, tapleafHash?: Buffer) {
        this.pubkey = pubkey;
        this.signature = signature;
        this.tapleafHash = tapleafHash;
    }
}