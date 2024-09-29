import { Keypair } from '@solana/web3.js';
import {derivePath } from 'ed25519-hd-key'; 
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import HDKey from 'hdkey';

  describe('test', () => {
    it('test', async () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const derivedSeed = derivePath('m/44\'/501\'/0\'', seed.toString('hex')).key;
      const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);

      // Create a Keypair object from the generated keypair
      const solanaKeypair = Keypair.fromSecretKey(keypair.secretKey);
    
      // Extract the public key (Solana address)
      const publicKey = solanaKeypair.publicKey.toString();

      console.log('sol ed25519 pubkey', solanaKeypair.publicKey.toBuffer().toString('hex'));

      // console.log(Buffer.from(solanaKeypair.secretKey).toString("hex"));
    
      console.log('Generated Solana Address (Public Key):', publicKey);

      const hdkey = HDKey.fromMasterSeed(seed);

      const childkey = hdkey.derive('m/44\'/501\'/0\'');

      console.log('k1 bip32 key:', childkey.publicKey.toString('hex'));
    });


    it('test-sign-sol-msg', async () => {
        const solMsg = 'ff736f6c616e61206f6666636861696e00001c004c6f6e67204f66662d436861696e2054657374204d6573736167652e';
        const path = 'm/44\'/501\'/0\'';
        const msg = Buffer.from(solMsg, 'hex');
    
        // const transport = await TransportNodeUSB.connect({
        //     timeout: 100000,
        // });

        // const solana = new Solana(transport);

        // const signature = await solana.signOffchainMessage(path, msg);

        // console.log('signature', signature);
      });
});
  
  