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
}

/**
 * This object represents a request to be sent to the PubNub API.
 *
 * This struct represents a request to be sent to the PubNub API. It is used by the the
 * transport provider which implements {@link Transport} interface.
 *
 * All fields are representing certain parts of the request that can be used to prepare one.
 *
 * @typedef {Object} TransportRequest
 * @property path - Path to the resource.
 * @property [queryParameters] - Query parameters to be sent with the request.
 * @property method - Transport request HTTP method.
 * @property [body] - Body to be sent with the request.
 * @property timeout - For how long request should wait response from the server.
 */
export type TransportRequest = {
  /**
   * Remote resource path.
   */
  path: string;

  /**
   * Query parameters to be sent with the request.
   */
  queryParameters?: Record<string, string>;

  /**
   * Transport request HTTP method.
   */
  method: TransportMethod;

  /**
   * Headers to be sent with the request.
   */
  headers?: Record<string, string>;

  /**
   * Body to be sent with the request.
   *
   *
   */
  body?: ArrayBuffer | string;

  /**
   * For how long request should wait response from the server.
   */
  timeout: number;
};
