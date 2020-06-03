/** @flow */

import type Config from '../components/config';
import type Crypto from '../components/cryptography';
import type TokenManager from '../components/token_manager';
import type TelemetryManager from '../components/telemetry_manager';

export type Modules = {|
  config: Config,
  crypto: Crypto,
  tokenManager: TokenManager,
  telemetryManager: TelemetryManager,
|};

export type Record = { [key: string]: any };

type InjectedFunction<TArgs, TReturn> = (modules: Modules, ...args: TArgs) => TReturn

// endpoint definition structure
export type EndpointConfig<TParams, TResult> = {|
  getOperation: () => string,
  getRequestTimeout: InjectedFunction<[], number>,

  validateParams: InjectedFunction<[$Shape<TParams>], string | void>,
  prepareParams: InjectedFunction<[$Shape<TParams>], Record>,

  getAuthToken?: InjectedFunction<[TParams], string | void | null>,
  getRequestHeaders?: () => Record,

  getURL?: InjectedFunction<[TParams], string>,
  usePost?: InjectedFunction<[TParams], bool>,
  postURL?: InjectedFunction<[TParams], string>,
  usePatch?: InjectedFunction<[TParams], bool>,
  patchURL?: InjectedFunction<[TParams], string>,
  useDelete?: InjectedFunction<[TParams], bool>,

  isAuthSupported: () => bool,
  postPayload?: InjectedFunction<[TParams], any>,
  patchPayload?: InjectedFunction<[TParams], any>,

  handleResponse?: InjectedFunction<[Record, TParams], TResult>,
|};
