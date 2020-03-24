import { Connection, Invitation } from '@meeco/meeco-api-sdk';
import { CLIError } from '@oclif/errors';
import { AuthConfig } from './auth-config';
import { IYamlConfig } from './yaml-config';

interface IConnectionMetadata {
  toName: string;
  fromName: string;
}

interface IConnectionSpec {
  to: AuthConfig;
  from: AuthConfig;
}

export class ConnectionConfig {
  static kind = 'Connection';

  public readonly to: AuthConfig;
  public readonly from: AuthConfig;
  public readonly options: IConnectionMetadata;

  constructor(data: ConnectionConfig) {
    this.from = data.from;
    this.to = data.to;
    this.options = data.options;
  }

  static fromYamlConfig(
    yamlConfigObj: IYamlConfig<IConnectionMetadata, IConnectionSpec>
  ): ConnectionConfig {
    if (yamlConfigObj.kind !== ConnectionConfig.kind) {
      throw new CLIError(
        `Config file of incorrect kind: '${yamlConfigObj.kind}' (expected '${ConnectionConfig.kind}')`
      );
    }

    return new ConnectionConfig({
      from: AuthConfig.fromMetadata(yamlConfigObj.spec.from),
      to: AuthConfig.fromMetadata(yamlConfigObj.spec.to),
      options: yamlConfigObj.metadata
    });
  }

  static encodeFromJson(payload: {
    invitation: Invitation;
    fromUserConnection: Connection;
    toUserConnection: Connection;
    options: IConnectionMetadata;
  }) {
    return {
      kind: ConnectionConfig.kind,
      metadata: {
        invitation_id: payload.invitation.id,
        from_user_connection_id: payload.fromUserConnection.id,
        to_user_connection_id: payload.toUserConnection.id
      },
      spec: {
        ...payload.options
      }
    };
  }

  static encodeFromUsers(
    from: AuthConfig,
    to: AuthConfig
  ): IYamlConfig<IConnectionMetadata, IConnectionSpec> {
    return {
      kind: ConnectionConfig.kind,
      metadata: {
        fromName: '',
        toName: ''
      },
      spec: {
        from,
        to
      }
    };
  }
}
