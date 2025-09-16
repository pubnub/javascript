import { TransportResponse } from '../../src/core/types/transport-response';

/**
 * Helper function to create proper TransportResponse with encoded body
 * for unit tests. This ensures the body is properly encoded as ArrayBuffer
 * instead of a raw string, which is required by the TextDecoder.
 */
export function createMockResponse(data: any, status: number = 200): TransportResponse {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  return {
    url: 'test-url',
    status,
    body: encoder.encode(jsonString),
    headers: { 'content-type': 'text/javascript' },
  };
}
