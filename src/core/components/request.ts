/**
 * Network request module.
 *
 * @internal
 */

import { CancellationController, TransportMethod, TransportRequest } from '../types/transport-request';
import { createMalformedResponseError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { PubNubAPIError } from '../../errors/pubnub-api-error';
import RequestOperation from '../constants/operations';
import { PubNubFileInterface } from '../types/file';
import { Request } from '../interfaces/request';
import { Query } from '../types/api';
import uuidGenerator from './uuid';

/**
 * Base REST API request class.
 *
 * @internal
 */
export abstract class AbstractRequest<ResponseType, ServiceResponse extends object> implements Request<ResponseType> {
  /**
   * Service `ArrayBuffer` response decoder.
   */
  protected static decoder = new TextDecoder();

  /**
   * Request cancellation controller.
   */
  private _cancellationController: CancellationController | null;

  /**
   * Unique request identifier.
   */
  requestIdentifier = uuidGenerator.createUUID();

  /**
   * Construct base request.
   *
   * Constructed request by default won't be cancellable and performed using `GET` HTTP method.
   *
   * @param params - Request configuration parameters.
   */
  protected constructor(
    private readonly params?: { method?: TransportMethod; cancellable?: boolean; compressible?: boolean },
  ) {
    this._cancellationController = null;
  }

  /**
   * Retrieve configured cancellation controller.
   *
   * @returns Cancellation controller.
   */
  public get cancellationController(): CancellationController | null {
    return this._cancellationController;
  }

  /**
   * Update request cancellation controller.
   *
   * Controller itself provided by transport provider implementation and set only when request
   * sending has been scheduled.
   *
   * @param controller - Cancellation controller or `null` to reset it.
   */
  public set cancellationController(controller: CancellationController | null) {
    this._cancellationController = controller;
  }
  /**
   * Abort request if possible.
   *
   * @param [reason] Information about why request has been cancelled.
   */
  abort(reason?: string): void {
    if (this && this.cancellationController) this.cancellationController.abort(reason);
  }

  /**
   * Target REST API endpoint operation type.
   */
  operation(): RequestOperation {
    throw Error('Should be implemented by subclass.');
  }

  /**
   * Validate user-provided data before scheduling request.
   *
   * @returns Error message if request can't be sent without missing or malformed parameters.
   */
  validate(): string | undefined {
    return undefined;
  }

  /**
   * Parse service response.
   *
   * @param response - Raw service response which should be parsed.
   */
  async parse(response: TransportResponse): Promise<ResponseType> {
    return this.deserializeResponse(response) as unknown as ResponseType;
  }

  /**
   * Create platform-agnostic request object.
   *
   * @returns Request object which can be processed using platform-specific requirements.
   */
  request(): TransportRequest {
    const request: TransportRequest = {
      method: this.params?.method ?? TransportMethod.GET,
      path: this.path,
      queryParameters: this.queryParameters,
      cancellable: this.params?.cancellable ?? false,
      compressible: this.params?.compressible ?? false,
      timeout: 10,
      identifier: this.requestIdentifier,
    };

    // Attach headers (if required).
    const headers = this.headers;
    if (headers) request.headers = headers;

    // Attach body (if required).
    if (request.method === TransportMethod.POST || request.method === TransportMethod.PATCH) {
      const [body, formData] = [this.body, this.formData];
      if (formData) request.formData = formData;
      if (body) request.body = body;
    }

    return request;
  }

  /**
   * Target REST API endpoint request headers getter.
   *
   * @returns Key/value headers which should be used with request.
   */
  protected get headers(): Record<string, string> | undefined {
    return {
      'Accept-Encoding': 'gzip, deflate',
      ...((this.params?.compressible ?? false) ? { 'Content-Encoding': 'deflate' } : {}),
    };
  }

  /**
   * Target REST API endpoint request path getter.
   *
   * @returns REST API path.
   */
  protected get path(): string {
    throw Error('`path` getter should be implemented by subclass.');
  }

  /**
   * Target REST API endpoint request query parameters getter.
   *
   * @returns Key/value pairs which should be appended to the REST API path.
   */
  protected get queryParameters(): Query {
    return {};
  }

  protected get formData(): Record<string, string>[] | undefined {
    return undefined;
  }

  /**
   * Target REST API Request body payload getter.
   *
   * @returns Buffer of stringified data which should be sent with `POST` or `PATCH` request.
   */
  protected get body(): ArrayBuffer | PubNubFileInterface | string | undefined {
    return undefined;
  }

  /**
   * Deserialize service response.
   *
   * @param response - Transparent response object with headers and body information.
   *
   * @returns Deserialized service response data.
   *
   * @throws {Error} if received service response can't be processed (has unexpected content-type or can't be parsed as
   * JSON).
   */
  protected deserializeResponse(response: TransportResponse): ServiceResponse {
    const responseText = AbstractRequest.decoder.decode(response.body);
    const contentType = response.headers['content-type'];
    let parsedJson: ServiceResponse;

    if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
      throw new PubNubError(
        'Service response error, check status for details',
        createMalformedResponseError(responseText, response.status),
      );

    try {
      parsedJson = JSON.parse(responseText);
    } catch (error) {
      console.error('Error parsing JSON response:', error);

      throw new PubNubError(
        'Service response error, check status for details',
        createMalformedResponseError(responseText, response.status),
      );
    }

    // Throw and exception in case of client / server error.
    if ('status' in parsedJson && typeof parsedJson.status === 'number' && parsedJson.status >= 400)
      throw PubNubAPIError.create(response);

    return parsedJson;
  }
}
