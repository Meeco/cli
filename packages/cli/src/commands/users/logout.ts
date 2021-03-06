import { UserService } from '@meeco/sdk';
import { AuthConfig } from '../../configs/auth-config';
import authFlags from '../../flags/auth-flags';
import MeecoCommand from '../../util/meeco-command';

export default class LogoutUser extends MeecoCommand {
  static description = 'Log the given user out of both keystore and vault.';
  static examples = [`meeco users:logout -a path/to/user-auth.yaml`];

  static flags = {
    ...MeecoCommand.flags,
    ...authFlags,
  };

  async run() {
    const { flags } = this.parse(this.constructor as typeof LogoutUser);

    try {
      const environment = await this.readEnvironmentFile();
      const service = new UserService(environment);
      const { auth } = flags;
      const authConfig = await this.readConfigFromFile(AuthConfig, auth);
      if (!authConfig) {
        this.error('Must specify a valid auth config file');
      }

      this.updateStatus('Logging out');
      await service.deleteSessionTokens(
        authConfig.vault_access_token,
        authConfig.keystore_access_token
      );
      this.finish();
    } catch (err) {
      await this.handleException(err);
    }
  }
}
