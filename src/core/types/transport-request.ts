import { PubNubFileInterface } from './file';
import { Query } from './api';

/**
 * Enum representing possible transport methods for HTTP requests.
 *
 * @enum {number}
 */
export enum TransportMethod {
  /**
   * Request will be sent using `GET` method.
   */
  GET = 'GET',
  /**
   * Request will be sent using `POST` method.
   */
  POST = 'POST',
  /**
   * Request will be sent using `PATCH` method.
   */
  PATCH = 'PATCH',
  /**
   * Request will be sent using `DELETE` method.
   */
  DELETE = 'DELETE',

  /**
   * Local request.
   *
   * Request won't be sent to the service and probably used to compute URL.
   */
  LOCAL = 'LOCAL',
}

/**
 * Request cancellation controller.
 */
export type CancellationController = {
  /**
   * Request cancellation / abort function.
   */
  abort: () => void;
};

/**
 * This object represents a request to be sent to the PubNub API.
 *
 * This struct represents a request to be sent to the PubNub API. It is used by the transport
 * provider which implements {@link Transport} interface.
 *
 * All fields are representing certain parts of the request that can be used to prepare one.
 */
export type TransportRequest = {
  /**
   * Remote host name.
   */
  origin?: string;

  /**
   * Remote resource path.
   */
  path: string;

  /**
   * Query parameters to be sent with the request.
   */
  queryParameters?: Query;

  /**
   * Transport request HTTP method.
   */
  method: TransportMethod;

  /**
   * Headers to be sent with the request.
   */
  headers?: Record<string, string>;

  /**
   * Multipart form data fields.
   *
   * **Important:** `Content-Type` header should be sent the {@link body} data type when
   * `multipart/form-data` should request should be sent.
   */
  formData?: Record<string, string>[];

  /**
   * Body to be sent with the request.
   */
  body?: ArrayBuffer | PubNubFileInterface | string;

  /**
   * For how long request should wait response from the server.
   *
   * @default `10` seconds.
   */
  timeout: number;

  /**
   * Whether request can be cancelled or not.
   *
   * @default `false`.
   */
  cancellable: boolean;

  /**
   * Unique request identifier.
   */
  identifier: string;
};
