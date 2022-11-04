/* eslint-disable @typescript-eslint/no-explicit-any */
import { Operation } from '../constants/operations';

type Modules = {
  config: any;
};

export type Endpoint<P, R> = {
  getOperation(): Operation | string;
  getRequestTimeout(modules: Modules): number;
  isAuthSupported(): boolean;

  validateParams(modules: Modules, params: P): string | void;

  usePost?(modules: Modules, params: P): boolean;

  getURL?(modules: Modules, params: P): string;
  postURL?(modules: Modules, params: P): string;

  prepareParams?(modules: Modules, params: P): Record<string, string | number>;
  postPayload?(modules: Modules, params: P): unknown;

  handleResponse(modules: Modules, response: any): R;
};
