/**
 * Represents a transport response from a service.
 */
export type TransportResponse = {
  /**
   * Full remote resource URL used to retrieve response.
   */
  url: string;

  /**
   * Service response status code.
   */
  status: number;

  /**
   * Service response headers.
   *
   * **Important:** Header names are in lowercase.
   */
  headers: Record<string, string>;

  /**
   * Service response body.
   */
  body?: ArrayBuffer;
};
