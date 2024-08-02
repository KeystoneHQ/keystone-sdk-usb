import * as uuid from 'uuid';
import {
    QRHardwareCall, CryptoKeypath, PathComponent, KeyDerivation, KeyDerivationSchema, Curve,
    DerivationAlgorithm, QRHardwareCallType, CryptoMultiAccounts
} from '@keystonehq/bc-ur-registry'
import { UR, UREncoder, URDecoder } from '@ngraveio/bc-ur';
import { Actions, TransportWebUSB, Chain, type TransportConfig, logMethod } from '@keystonehq/hw-transport-webusb';
import { throwTransportError, Status } from '@keystonehq/hw-transport-error';
import { SignType, SolSignRequest } from '@keystonehq/bc-ur-registry-sol'


const pathToKeypath = (path: string): CryptoKeypath => {
    const paths = path.replace(/[m|M]\//, '').split('/')
    const pathComponents = paths.map(path => {
        const index = parseInt(path.replace("'", ''), 10)
        const isHardened = path.endsWith("'")
        return new PathComponent({ index, hardened: isHardened })
    })
    return new CryptoKeypath(pathComponents)
}

export default class Solana {
    private transport: TransportWebUSB;
    private mfp: string | undefined;
    constructor(transport: TransportWebUSB) {
        // Initialize Solana connection
        this.transport = transport;
    }

    private precheck() {
        if (!this.transport) {
            throwTransportError(Status.ERR_TRANSPORT_HAS_NOT_BEEN_SET);
        }
        if (!this.mfp) {
            new Error("missing mfp for this wallet");
        }
    }

    private async sendToDevice(actions: Actions, data: any): Promise<any> {
        return this.transport.send(actions, data);
    }

    async getAddress(path: string, dislay: boolean = false): Promise<{ address: Buffer }> {

        // Send a request to the device to get the address at the specified path
        const curve = Curve.ed25519;
        const algo = DerivationAlgorithm.slip10
        const kds = new KeyDerivationSchema(pathToKeypath(path), curve, algo)
        const keyDerivation = new KeyDerivation([kds])
        const hardwareCall = new QRHardwareCall(QRHardwareCallType.KeyDerivation, keyDerivation, origin)
        let ur = hardwareCall.toUR()
        const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

        console.log('--------', encodedUR);

        const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);

        let resultUR = parseResponoseUR(response.payload);
        
        let account = CryptoMultiAccounts.fromCBOR(resultUR.cbor);

        let keys = account.getKeys()[0];

        this.mfp = account.getMasterFingerprint().toString('hex');
        
        console.log("--------------")
        console.log(keys)
        console.log("--------------")
    
        return {
            address: Buffer.from("")
        }
    }

    // async signTransaction(path: string, txBuffer: Buffer): Promise<{ signature: Buffer }> {

    //     const requestId = uuid.v4();
    //     let solRequest = SolSignRequest.constructSOLRequest(
    //         txBuffer,
    //         path,
    //         this.mfp!,
    //         SignType.Transaction,
    //         requestId
    //     );

    //     const ur = solRequest.toUR();

    //     const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();

    //     const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);


    //     const decoder = new URDecoder();
    //     decoder.receivePart(response.payload);
    //     if (!decoder.isComplete()) {
    //         throwTransportError(Status.ERR_UR_INCOMPLETE);
    //     }

    //     return parseTransaction(signatureResponse.payload, tx);
    // }

    // async signOffchainMessage(path: string, msgBuffer: Buffer): Promise<{ signature: Buffer }> {
    //     return {
    //         signature: Buffer.from("")
    //     }
    // }
}

const parseResponoseUR = (urPlayload:string) => {
    const decoder = new URDecoder();
    decoder.receivePart(urPlayload);
    if (!decoder.isComplete()) {
        throwTransportError(Status.ERR_UR_INCOMPLETE);
    }
    const resultUR = decoder.resultUR();
    return resultUR;
}


const parseSignatureUR = (payload) => {

}



