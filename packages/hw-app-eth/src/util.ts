import elliptic from 'elliptic';

export const convertCompresskey = (compressedPublicKey: string) => {
    const ec = new elliptic.ec('secp256k1');
    // Convert the compressed public key to a key pair object
    const key = ec.keyFromPublic(compressedPublicKey, 'hex');

    // Get the uncompressed public key
    let uncompressed =  key.getPublic();
    return uncompressed.encode('hex', false);
}
