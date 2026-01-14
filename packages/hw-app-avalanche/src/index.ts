import Base, { parseResponoseUR } from '@keystonehq/hw-app-base';
import { Actions, TransportHID } from '@keystonehq/hw-transport-usb';
import { Curve, DerivationAlgorithm } from '@keystonehq/bc-ur-registry';
import { UnsignedTx, EVMUnsignedTx } from '@avalabs/avalanchejs';
import { AvalancheSignRequest, AvalancheSignature, AvalancheUtxoData } from '@keystonehq/bc-ur-registry-avalanche';
import { UREncoder } from '@ngraveio/bc-ur';
import { Buffer } from 'buffer';

export enum ChainIDAlias {
  X = 'X',
  P = 'P',
  C = 'C',
}

type SignTx = (tx: UnsignedTx | EVMUnsignedTx, derivationPaths: string[], utxos: AvalancheUtxoData[], xfp: string) => Promise<string[]>;
type SignTxHex = (txHex: string, derivationPaths: string[], utxos: AvalancheUtxoData[], xfp: string) => Promise<string[]>;

const CChainDerivationPath = "m/44'/60'/0'";
const XPChainDerivationPath = "m/44'/9000'/0'";

export default class Avalanche extends Base {
  public mfp: string | undefined;

  constructor(transport: TransportHID, mfp?: string) {
    super(transport, mfp);
    if (mfp) {
      this.mfp = mfp;
    }
  }

  async getExtendedPublicKey(chain?: ChainIDAlias): Promise<{ publicKey: string, mfp: string, chainCode: Buffer }> {
    let path = CChainDerivationPath;
    switch (chain) {
      case ChainIDAlias.P:
      case ChainIDAlias.X:
        path = XPChainDerivationPath;
        break;
      case ChainIDAlias.C:
        path = CChainDerivationPath;
      default:
        break;
    }

    return await this.getPubkey(path, Curve.secp256k1, DerivationAlgorithm.slip10);
  }

  signTx: SignTx = async (tx, derivationPaths, utxos, xfp) => {
    return await this.signTxHex(Buffer.from(tx.toBytes()).toString('hex'), derivationPaths, utxos, xfp);
  }

  signTxHex: SignTxHex = async (txHex, derivationPaths, utxos, xfp) => {
    const ur = AvalancheSignRequest.constructAvalancheRequest(Buffer.from(txHex, 'hex'), derivationPaths, utxos, xfp).toUR();
    const encodedUR = new UREncoder(ur, Infinity).nextPart().toUpperCase();
    const response = await this.sendToDevice(Actions.CMD_RESOLVE_UR, encodedUR);
    const resultUR = parseResponoseUR(response.payload);
    const result = AvalancheSignature.fromCBOR(resultUR.cbor);
    const sigBuffers = result.getSignatures();
    if (!sigBuffers || sigBuffers.length === 0) {
      throw new Error("No signatures returned from device");
    }
    const finalSigHexArray = sigBuffers.map(sig => sig.toString('hex'));
    return finalSigHexArray;
  }
}