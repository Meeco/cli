// import { fetchConnectionWithId, ItemService } from '@meeco/sdk';
// import { flags as _flags } from '@oclif/command';
// import { CLIError } from '@oclif/errors';
// import { AuthConfig } from '../../configs/auth-config';
// import { ShareConfig } from '../../configs/share-config';
// import MeecoCommand from '../../util/meeco-command';

// export default class SharesCreateConfig extends MeecoCommand {
//   static description = 'Provide two users and an item id to construct a share config file';

//   static flags = {
//     ...MeecoCommand.flags,
//     itemId: _flags.string({
//       required: true,
//       char: 'i',
//       description: `Item id of the 'from' user to share with the 'to' use`
//     }),
//     from: _flags.string({
//       required: true,
//       char: 'f',
//       description: `User config file for the 'from' user`
//     }),
//     connectionId: _flags.string({
//       required: true,
//       char: 'c',
//       description: `Connection id for the 'to' user`
//     })
//   };

//   static args = [];

//   async run() {
//     try {
//       const { flags } = this.parse(this.constructor as typeof SharesCreateConfig);
//       const { from, connectionId, itemId } = flags;
//       const environment = await this.readEnvironmentFile();
//       const fromUser = await this.readConfigFromFile(AuthConfig, from);

//       if (!fromUser || !connectionId) {
//         this.error('Both a valid from and to user config file are required');
//       }

//       await fetchConnectionWithId(fromUser, connectionId, environment, this.updateStatus);

//       // Ensure the item to share exists first since setting up a first share takes a bit of work
//       await new ItemService(environment)
//         .get(itemId, fromUser.vault_access_token, fromUser.data_encryption_key)
//         .catch(err => {
//           if (err.status === 404) {
//             throw new CLIError(`Item with id '${itemId}' was not found on the 'from' user`);
//           }
//           throw err;
//         });
//       this.printYaml(ShareConfig.encodeFromUsersWithItem(fromUser, connectionId, itemId));
//     } catch (err) {
//       await this.handleException(err);
//     }
//   }
// }
