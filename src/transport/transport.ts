import { Transport } from '../core/interfaces/transport';
import { TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';

type BaseResponse = {
  status: number;
  headers: { get(name: string): string | null; forEach(callback: (value: string, key: string) => void): void };
  arrayBuffer(): Promise<ArrayBuffer>;
};

/**
 * Represents a base transport class for interpreting service responses into a platform-agnostic
 * data type.
 */
export class BaseTransport {
  /**
   * Interpret service response into platform-agnostic data type.
   *
   * @param {BaseResponse} response - The BaseResponse object to transport.
   * @returns {Promise<TransportResponse>} - A Promise that resolves to the TransportResponse
   * object.
   * @protected
   */
  protected async transportResponseFromResponse(response: BaseResponse): Promise<TransportResponse> {
    const contentLength = response.headers.get('Content-Length');
    const headers: Record<string, string> = {};
    let body: ArrayBuffer | undefined;

    // Copy Headers object content into plain Record.
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (contentLength ? parseInt(contentLength, 10) : 0 !== 0) {
      body = await response.arrayBuffer();
    }

    return {
      status: response.status,
      headers,
      body,
    };
  }
}
