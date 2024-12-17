import { HARDENED } from './types/public';

export enum PathTypes {
    // hd wallet account
    PATH_WALLET_ACCOUNT,
  
    // hd wallet address
    PATH_WALLET_SPENDING_KEY_BYRON,
    PATH_WALLET_SPENDING_KEY_SHELLEY,
  
    // hd wallet reward address, withdrawal witness, pool owner
    PATH_WALLET_STAKING_KEY,
  
    // DRep keys
    PATH_DREP_KEY,
  
    // constitutional committee keys
    PATH_COMMITTEE_COLD_KEY,
    PATH_COMMITTEE_HOT_KEY,
  
    // hd wallet multisig account
    PATH_WALLET_ACCOUNT_MULTISIG,
  
    // hd wallet multisig spending key
    PATH_WALLET_SPENDING_KEY_MULTISIG,
  
    // hd wallet multisig staking key
    PATH_WALLET_STAKING_KEY_MULTISIG,
  
    // key used for token minting
    PATH_WALLET_MINTING_KEY,
  
    // pool cold key in pool registrations and retirements
    PATH_POOL_COLD_KEY,
  
    // CIP-36 voting
    PATH_CVOTE_ACCOUNT,
    PATH_CVOTE_KEY,
  
    // not one of the above
    PATH_INVALID,
  }
  
  export const classifyPath = (path: number[]): PathTypes => {
    const HD = HARDENED;
  
    if (path.length < 3) return PathTypes.PATH_INVALID;
    if (path[1] !== 1815 + HD) return PathTypes.PATH_INVALID;
  
    switch (path[0]) {
      case 44 + HD:
        if (path.length === 3) return PathTypes.PATH_WALLET_ACCOUNT;
        if (path.length !== 5) return PathTypes.PATH_INVALID;
        if (path[3] === 0 || path[3] === 1)
          return PathTypes.PATH_WALLET_SPENDING_KEY_BYRON;
        break;
      case 1852 + HD:
        if (path.length === 3) return PathTypes.PATH_WALLET_ACCOUNT;
        if (path.length !== 5) return PathTypes.PATH_INVALID;
        if (path[3] === 0 || path[3] === 1)
          return PathTypes.PATH_WALLET_SPENDING_KEY_SHELLEY;
        if (path[3] === 2) return PathTypes.PATH_WALLET_STAKING_KEY;
        if (path[3] === 3) return PathTypes.PATH_DREP_KEY;
        if (path[3] === 4) return PathTypes.PATH_COMMITTEE_COLD_KEY;
        if (path[3] === 5) return PathTypes.PATH_COMMITTEE_HOT_KEY;
        break;
      case 1853 + HD:
        if (path.length === 4 && path[2] === 0 + HD && path[3] >= HD)
          return PathTypes.PATH_POOL_COLD_KEY;
        break;
      case 1854 + HD:
        if (path.length === 3) return PathTypes.PATH_WALLET_ACCOUNT_MULTISIG;
        if (path.length !== 5) return PathTypes.PATH_INVALID;
        if (path[3] === 0) return PathTypes.PATH_WALLET_SPENDING_KEY_MULTISIG;
        if (path[3] === 2) return PathTypes.PATH_WALLET_STAKING_KEY_MULTISIG;
        break;
      case 1855 + HD:
        if (path.length === 3 && path[2] >= 0 + HD)
          return PathTypes.PATH_WALLET_MINTING_KEY;
        break;
      case 1694 + HD:
        if (path.length === 3 && path[2] >= 0 + HD)
          return PathTypes.PATH_CVOTE_ACCOUNT;
        if (path.length === 5 && path[2] >= 0 + HD && path[3] === 0)
          return PathTypes.PATH_CVOTE_KEY;
        break;
      default:
        break;
    }
  
    return PathTypes.PATH_INVALID;
  };
  