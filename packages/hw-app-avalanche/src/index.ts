import Base from '@keystonehq/hw-app-base';
import { TransportHID } from '@keystonehq/hw-transport-usb';
import { Curve, DerivationAlgorithm } from '@keystonehq/bc-ur-registry';

export enum ChainIDAlias {
  X = 'X',
  P = 'P',
  C = 'C',
}

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
}