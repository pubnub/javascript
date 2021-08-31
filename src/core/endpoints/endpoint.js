/** @flow */

import type Config from '../components/config';
import type Crypto from '../components/cryptography';
import type TokenManager from '../components/token_manager';
import type TelemetryManager from '../components/telemetry_manager';
import type { FileClass } from '../../file';
import type { ICryptography } from '../../crypto';

export type Modules = {|
  config: Config,
  crypto: Crypto,
  cryptography: ICryptography<any>,
  tokenManager: TokenManager,
  telemetryManager: TelemetryManager,
  networking: any,
  PubNubFile: FileClass,
|};

export type Record = { [key: string]: any };

type InjectedFunction<TArgs, TReturn> = (modules: Modules, ...args: TArgs) => TReturn;
type InjectedMaybeAsyncFunction<TArgs, TReturn> = (modules: Modules, ...args: TArgs) => Promise<TReturn> | TReturn;

// endpoint definition structure
export type EndpointConfig<TParams, TResult> = {|
  getOperation: () => string,
  getRequestTimeout: InjectedFunction<[], number>,

  validateParams: InjectedFunction<[$Shape<TParams>], string | void>,
  prepareParams: InjectedFunction<[$Shape<TParams>], Record>,

  getRequestHeaders?: () => Record,

  getURL?: InjectedFunction<[TParams], string>,
  usePost?: InjectedFunction<[TParams], boolean>,
  postURL?: InjectedFunction<[TParams], string>,
  usePatch?: InjectedFunction<[TParams], boolean>,
  patchURL?: InjectedFunction<[TParams], string>,
  useDelete?: InjectedFunction<[TParams], boolean>,
  getFileURL?: InjectedFunction<[TParams], string>,
  useGetFile?: InjectedFunction<[TParams], boolean>,

  ignoreBody?: InjectedFunction<[TParams], boolean>,
  forceBuffered?: InjectedFunction<[TParams], boolean>,

  isAuthSupported: () => boolean,
  postPayload?: InjectedFunction<[TParams], any>,
  patchPayload?: InjectedFunction<[TParams], any>,

  handleResponse?: InjectedMaybeAsyncFunction<[Record, TParams], TResult>,
  handleError?: InjectedMaybeAsyncFunction<[Record, TParams], any>
|};
