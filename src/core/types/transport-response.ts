/**
 * Represents a transport response from a service.
 *
 * @typedef {Object} TransportResponse
 * @property status - The response status code.
 * @property headers - The response headers.
 * @property body - The response body.
 */
export type TransportResponse = {
  /**
   * Service response status code.
   */
  status: number;

  /**
   * Service response headers.
   */
  headers: Record<string, string>;

  /**
   * Service response body.
   */
  body?: ArrayBuffer;
};
