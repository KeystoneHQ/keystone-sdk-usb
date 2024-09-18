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

type BuildCryptoAccountArgs = {
  startIndex: number,
  endIndex: number,
  publicKey: string,
  chainCode: string,
  mfp: string,
  origin: string,
  note?: string,
}