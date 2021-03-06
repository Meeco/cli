import { Delegation } from '@meeco/keystore-api-sdk';
import { DelegationApi } from '@meeco/vault-api-sdk';
import DecryptedKeypair from '../models/decrypted-keypair';
import { SymmetricKey } from '../models/symmetric-key';
import Service, { IKEK, IKeystoreToken, IVaultToken } from './service';

/**
 * Used for setting up delegation connections between Meeco `User`s to allow the secure management of another users account
 */
export class DelegationService extends Service<DelegationApi> {
  public getAPI(token: IVaultToken) {
    return this.vaultAPIFactory(token).DelegationApi;
  }

  public async createChildUser(
    credentials: IKEK & IVaultToken & IKeystoreToken,
    childConnectionIdentifier: string
  ): Promise<Delegation> {
    const parentKek = credentials.key_encryption_key;

    this.logger.log('Generating keys for child user');
    const childKek = SymmetricKey.generate();
    const encryptedChildKek = await parentKek.encryptKey(childKek);

    const childDek = SymmetricKey.generate();
    const encryptedChildDek = await childKek.encryptKey(childDek);

    const childToParentKeyId = 'parent_connection';
    const childToParentKey = await DecryptedKeypair.generate();
    const encryptedChildToParentKey = await childKek.encryptKey(childToParentKey.privateKey);

    const parentToChildKeyId = childConnectionIdentifier;
    const parentToChildKey = await DecryptedKeypair.generate();
    const encryptedParentToChildKey = await parentKek.encryptKey(parentToChildKey.privateKey);

    await this.keystoreAPIFactory(credentials).KeypairApi.keypairsPost({
      public_key: parentToChildKey.publicKey.key,
      encrypted_serialized_key: encryptedParentToChildKey,
      metadata: {},
      external_identifiers: [parentToChildKeyId],
    });

    this.logger.log('Creating child user');
    const childUserResponse = await this.vaultAPIFactory(credentials).DelegationApi.childUsersPost({
      parent_public_key_for_connection: {
        pem: parentToChildKey.publicKey.key,
        external_id: parentToChildKeyId,
      },
      child_public_key_for_connection: {
        pem: childToParentKey.publicKey.key,
        external_id: childToParentKeyId,
      },
    });

    const childUser = childUserResponse.user;

    // check existence of delegation_token in untyped field integration_data
    const integrationData =
      childUserResponse.connection_from_parent_to_child.the_other_user.integration_data;
    if (integrationData == null) {
      throw new Error('Missing delegation token after creating child user in Vault');
    }
    const delegation_token: string = integrationData['delegation_token'];

    this.logger.log('Saving child user keys to keystore');
    return await this.keystoreAPIFactory(credentials)
      .DelegationApi.childUsersPost({
        vault_child_id: childUser.id,
        child_kek: encryptedChildKek,
        child_dek: encryptedChildDek,
        child_keypair_for_connection: {
          encrypted_private_key: encryptedChildToParentKey,
          public_key: childToParentKey.publicKey.key,
          external_id: childToParentKeyId,
        },
        delegation_token,
      })
      .then(result => {
        return result.delegation;
      });
  }
}
