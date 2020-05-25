import * as Keystore from '@meeco/keystore-api-sdk';
import * as Vault from '@meeco/vault-api-sdk';
import { Configuration } from '@meeco/vault-api-sdk';
import { blue, green } from 'chalk';
import * as debug from 'debug';
import * as FormData from 'form-data';
import nodeFetch from 'node-fetch';
import { AuthConfig } from '../configs/auth-config';
import { IEnvironment } from '../models/environment';

const debugCurl = debug('meeco:http');
(<any>global).FormData = FormData;

const X_MEECO_API_VERSION = '2.0.0';

/**
 * User authentication token for the given API or the entire user with tokens
 */
type UserAuth = AuthConfig | string;

type KeystoreAPIConstructor = new () => Keystore.BaseAPI;
type VaultAPIConstructor = new () => Vault.BaseAPI;

type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];
type VaultAPIName = KeysOfType<typeof Vault, VaultAPIConstructor>;
type KeystoreAPIName = KeysOfType<typeof Keystore, KeystoreAPIConstructor>;

const vaultToken = (userAuth: UserAuth) => {
  return typeof userAuth === 'string' ? userAuth : userAuth.vault_access_token;
};

const keystoreToken = (userAuth: UserAuth) => {
  return typeof userAuth === 'string' ? userAuth : userAuth.keystore_access_token;
};

/**
 * Pluck environment and user auth values to create `apiKey` [Keystore.Configuration] parameter
 */
const keystoreAPIKeys = (environment: IEnvironment, userAuth: UserAuth) => (name: string) =>
  ({
    'Meeco-Subscription-Key': environment.keystore.subscription_key,
    // Must be uppercase
    // prettier-ignore
    'Authorization': keystoreToken(userAuth)
  }[name]);

/**
 * Pluck environment and user auth values to create `apiKey` [Vault.Configuration] parameter
 */
const vaultAPIKeys = (environment: IEnvironment, userAuth: UserAuth) => (name: string) =>
  ({
    'Meeco-Subscription-Key': environment.vault.subscription_key,
    // Must be uppercase
    // prettier-ignore
    'Authorization': vaultToken(userAuth)
  }[name]);

function fetchInterceptor(url, options) {
  debugCurl(blue(`Sending Request:`));
  debugCurl(toCurl(url, options));
  return nodeFetch(url, options).then(async response => {
    debugCurl(green(`Received Response:`));
    debugCurl(`\
status: ${response.status}
statusText: ${response.statusText}
`);
    return response;
  });
}

const callApiWithDefaultHeaders = (
  sdk: any,
  api: string,
  apiMethodName: string | symbol | number,
  apiKey: string | ((name: string) => string),
  basePath: string,
  defaultHeaders: { [key: string]: string },
  args: any[]
) => {
  const apiInstance = new sdk[api](
    new Configuration({
      apiKey,
      basePath,
      middleware: [],
      headers: {
        ...defaultHeaders
      },
      fetchApi: fetchInterceptor
    }),
    null
    // fetchInterceptor
  );
  const apiMethod = apiInstance[apiMethodName];
  return apiMethod.call(apiInstance, ...args).catch(err => {
    if (err.status === 426) {
      throw new Error(
        'The API returned 426 and therefore does not support this version of the CLI. Please check for an update to the Meeco CLI.'
      );
    } else {
      throw err;
    }
  });
};

/**
 * Helper for constructing instances of Keystore apis with all the required auth params
 */
const keystoreAPI = (api: KeystoreAPIName, environment: IEnvironment, userAuth: UserAuth) => {
  return new Proxy(
    {},
    {
      get(target, apiMethodName) {
        return (...args) =>
          callApiWithDefaultHeaders(
            Keystore,
            api,
            apiMethodName,
            keystoreAPIKeys(environment, userAuth),
            environment.keystore.url,
            {
              X_MEECO_API_VERSION: '2.0.0',
              X_MEECO_API_COMPONENT: 'keystore'
            },
            args
          );
      }
    }
  ) as InstanceType<typeof Keystore[typeof api]>;
};

/**
 * Helper for constructing instances of Vault apis with all the required auth params
 */
const vaultAPI = (api: VaultAPIName, environment: IEnvironment, userAuth: UserAuth) => {
  return new Proxy(
    {},
    {
      get(target, apiMethodName) {
        return (...args) =>
          callApiWithDefaultHeaders(
            Vault,
            api,
            apiMethodName,
            vaultAPIKeys(environment, userAuth),
            environment.vault.url,
            {
              X_MEECO_API_VERSION,
              X_MEECO_API_COMPONENT: 'vault'
            },
            args
          );
      }
    }
  ) as InstanceType<typeof Vault[typeof api]>;
};

/**
 * Convenience for the various headers and parameters that need to be setup when constructing an API.
 *
 * It avoids a lot of boilerplate in constructing arguments for an api (api keys, subscription keys etc.)
 *
 * Basically, instead of
 * ```ts
 * new Keystore.EncryptionSpaceApi({
 *  baseApi: environment.api.url,
 *   apiKey: (key: string) => {
 *    if(key === 'Meeco-Subscription-Key') return environment.keystore.subscription_key;
 *    if(key === 'Authorization) return user.keystore_access_token
 *   }
 * }).someMethod();
 * ```
 *
 * you can create a factory that returns these instances for you:
 *
 * ```ts
 * const factory = keystoreAPIFactory(environment);
 * const forUser = factory(userAuth);
 * forUser.EncryptionSpaceApi.getItems();
 * forUser.KeypairApi.getConnections();
 * // etc...
 * ```
 */
export type KeystoreAPIFactory = (userAuth: UserAuth) => KeystoreAPIFactoryInstance;
type KeystoreAPIFactoryInstance = {
  [key in KeystoreAPIName]: InstanceType<typeof Keystore[key]>;
};

/**
 * Convenience for the various headers and parameters that need to be setup when constructing an API.
 *
 * It avoids a lot of boilerplate in constructing arguments for an api (api keys, subscription keys etc.)
 *
 * Basically, instead of
 * ```ts
 * new Vault.ItemApi({
 *  baseApi: environment.api.url,
 *   apiKey: (key: string) => {
 *    if(key === 'Meeco-Subscription-Key') return environment.vault.subscription_key;
 *    if(key === 'Authorization) return user.vault_access_token
 *   }
 * }).someMethod();
 * ```
 *
 * you can create a factory that returns these instances for you:
 *
 * ```ts
 * const factory = vaultAPIFactory(environment);
 * const forUser = factory(userAuth);
 * forUser.ItemsAPI.getItems();
 * forUser.ConnectionAPI.getConnections();
 * // etc...
 * ```
 */
export type VaultAPIFactory = (userAuth: UserAuth) => VaultAPIFactoryInstance;
type VaultAPIFactoryInstance = { [key in VaultAPIName]: InstanceType<typeof Vault[key]> };

/**
 * Results in a factory function that can be passed user auth information and then get
 * arbitrary Keystore api instances to use.
 */
export const keystoreAPIFactory = (environment: IEnvironment) => (userAuth: UserAuth) =>
  new Proxy(
    {},
    {
      get(target, property: KeystoreAPIName) {
        return keystoreAPI(property, environment, userAuth);
      }
    }
  ) as KeystoreAPIFactoryInstance;

/**
 * Results in a factory function that can be passed user auth information and then get
 * arbitrary Vault api instances to use.
 */
export const vaultAPIFactory = (environment: IEnvironment) => (userAuth: UserAuth) =>
  new Proxy(
    {},
    {
      get(target, property: VaultAPIName) {
        return vaultAPI(property, environment, userAuth);
      }
    }
  ) as VaultAPIFactoryInstance;

const toCurl = (url, options) => {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };
  const allHeaders = {
    ...defaultHeaders,
    ...options.headers
  };
  const headersString = Object.keys(allHeaders)
    .map(key => `  --header "${key}: ${allHeaders[key]}"`)
    .join(' \\\n');

  return `\
curl \\
  ${headersString.trim()} \\
  --request ${options.method} \\
  --data ${options.body || '{}'} \\
  ${url}
  `;
};
