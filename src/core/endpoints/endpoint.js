/** @flow */

import type Config from '../components/config';
import type Crypto from '../components/cryptography';
import type TokenManager from '../components/token_manager';
import type TelemetryManager from '../components/telemetry_manager';
import type { FileClass } from '../components/file';

export type Modules = {|
  config: Config,
  crypto: Crypto,
  tokenManager: TokenManager,
  telemetryManager: TelemetryManager,
  networking: any,
  getFile: () => FileClass,
|};

export type Record = { [key: string]: any };

type InjectedFunction<TArgs, TReturn> = (modules: Modules, ...args: TArgs) => TReturn;

// endpoint definition structure
export type EndpointConfig<TParams, TResult> = {|
  getOperation: () => string,
  getRequestTimeout: InjectedFunction<[], number>,

  validateParams: InjectedFunction<[$Shape<TParams>], string | void>,
  prepareParams: InjectedFunction<[$Shape<TParams>], Record>,

  getAuthToken?: InjectedFunction<[TParams], string | void | null>,
  getRequestHeaders?: () => Record,

  getURL?: InjectedFunction<[TParams], string>,
  usePost?: InjectedFunction<[TParams], boolean>,
  postURL?: InjectedFunction<[TParams], string>,
  usePatch?: InjectedFunction<[TParams], boolean>,
  patchURL?: InjectedFunction<[TParams], string>,
  useDelete?: InjectedFunction<[TParams], boolean>,

  ignoreBody?: InjectedFunction<[TParams], boolean>,

  isAuthSupported: () => boolean,
  postPayload?: InjectedFunction<[TParams], any>,
  patchPayload?: InjectedFunction<[TParams], any>,

  handleResponse?: InjectedFunction<[Record, TParams], TResult>,
|};
