import { Keypair as APIKeypair } from '@meeco/keystore-api-sdk';
import cryppo from '../services/cryppo-service';
import RSAPrivateKey from './rsa-private-key';
import RSAPublicKey from './rsa-public-key';
import { SymmetricKey } from './symmetric-key';

/**
 * An asymmetric encryption (public/private) key pair, with the private key decrypted.
 *
 * Encryption and decryption methods are defined on the classes {@link RSAPublickey} and {@link RSAPrivatekey} which may
 * be used if only one key is available.
 */
export default class DecryptedKeypair {
  publicKey: RSAPublicKey;
  privateKey: RSAPrivateKey;

  /** A new random keypair. */
  static async generate(keyBits = 4096, externalIds: string[] = []): Promise<DecryptedKeypair> {
    const { privateKey, publicKey } = await cryppo.generateRSAKeyPair(keyBits);
    return new DecryptedKeypair(publicKey, privateKey, externalIds);
  }

  /**
   * Decrypts a keypair from the Meeco Keystore.
   * @param keyEncryptionKey Key used to encrypt the private key.
   * @param keypair From the API response.
   */
  static async fromAPI(
    keyEncryptionKey: SymmetricKey,
    keypair: APIKeypair
  ): Promise<DecryptedKeypair> {
    const { id, public_key, encrypted_serialized_key, external_identifiers } = keypair;
    // decrypt serialized private key, check correct
    const privateKey = await keyEncryptionKey.decryptString(encrypted_serialized_key);
    return new DecryptedKeypair(public_key, privateKey!, external_identifiers, id);
  }

  /**
   * @param publicKey PEM formatted public key string.
   * @param privateKey PEM formatted private key string.
   * @param externalIds An optional array of identifier strings from the Meeco Keystore.
   * @param keystoreId An optional GUID for the Keypair in the Keystore. Typically only set if constructed with {@link fromAPI}.
   */
  constructor(
    publicKey: string,
    privateKey: string,
    public externalIds: string[] = [],
    public keystoreId?: string
  ) {
    this.publicKey = new RSAPublicKey(publicKey);
    this.privateKey = new RSAPrivateKey(privateKey);
  }
}
