import { TransportResponse } from '../types/transport-response';
import { TransportRequest } from '../types/transport-request';
import RequestOperation from '../constants/operations';

/**
 * General REST API call request interface.
 *
 * @internal
 */
export interface Request<ResponseType> {
  /**
   * Type of request operation.
   *
   * PubNub REST API endpoint which will be called with request.
   */
  operation(): RequestOperation;

  /**
   * Validate provided request parameters.
   *
   * @returns Error message if request can't be sent without missing or malformed parameters.
   */
  validate(): string | undefined;

  /**
   * Compile all parameters into transparent data type.
   *
   * @returns Transport request which can be processed by the network layer.
   */
  request(): TransportRequest;

  /**
   * Process service response.
   *
   * @param [response] Successful request response from the service.
   *
   * @returns Service response mapped to the expected data type or `undefined` in case of error.
   */
  parse(response: TransportResponse): Promise<ResponseType>;
}
