type BuildCryptoHDKeyArgs = {
  publicKey: string,
  chainCode: string,
  mfp: string,
  origin: string,
  children?: string,
  originIndex?: number,
  childIndex?: number,
  note?: string,
}

type KeyInfo = {
  publicKey: string,
  chainCode: string,
  mfp: string,
}

type BuildCryptoAccountArgs = {
  startIndex?: number,
  keys: KeyInfo[],
  origin: string,
  note?: string,
}