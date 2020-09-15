import { ShareService } from '@meeco/sdk';
import { AuthConfig } from '../../configs/auth-config';
import { authFlags } from '../../flags/auth-flags';
import MeecoCommand from '../../util/meeco-command';

export default class SharesUpdate extends MeecoCommand {
  static description = 'Update all shares of an item';

  static flags = {
    ...MeecoCommand.flags,
    ...authFlags,
  };

  static args = [
    {
      name: 'itemId',
      required: true,
      description: 'ID of the share to fetch',
    },
  ];

  async run() {
    const { args, flags } = this.parse(this.constructor as typeof SharesUpdate);

    const { auth } = flags;
    const { itemId } = args;
    const environment = await this.readEnvironmentFile();

    const authConfig = await this.readConfigFromFile(AuthConfig, auth);

    if (!authConfig) {
      this.error('Valid auth config file must be supplied');
    }

    const service = new ShareService(environment, this.updateStatus);
    try {
      const reslut = await service.updateSharedItem(authConfig, itemId);
      this.printYaml(reslut);
    } catch (err) {
      await this.handleException(err);
    }
  }
}