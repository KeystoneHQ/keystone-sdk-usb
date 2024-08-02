import { Keypair } from '@solana/web3.js'
import {derivePath } from "ed25519-hd-key"; 
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import HDKey from 'hdkey';

  describe('test', () => {
    it('test', async () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const derivedSeed = derivePath("m/44'/501'/0'", seed.toString('hex')).key;
      const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);

      // Create a Keypair object from the generated keypair
      const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);
    
      // Extract the public key (Solana address)
      const publicKey = solanaKeypair.publicKey.toString();

      console.log("sol ed25519 pubkey", solanaKeypair.publicKey.toBuffer().toString("hex"))

      // console.log(Buffer.from(solanaKeypair.secretKey).toString("hex"));
    
      console.log('Generated Solana Address (Public Key):', publicKey);

      const hdkey = HDKey.fromMasterSeed(seed);

      var childkey = hdkey.derive("m/44'/501'/0'");

      console.log('k1 bip32 key:', childkey.publicKey.toString("hex"));
    })
});
  
  