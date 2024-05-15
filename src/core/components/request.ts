import { CancellationController, TransportMethod, TransportRequest } from '../types/transport-request';
import { TransportResponse } from '../types/transport-response';
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
export abstract class AbstractRequest<ResponseType> implements Request<ResponseType> {
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
  protected constructor(private readonly params?: { method?: TransportMethod; cancellable?: boolean }) {
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
   */
  abort(): void {
    if (this && this.cancellationController) this.cancellationController.abort();
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
   * @param _response - Raw service response which should be parsed.
   */
  async parse(_response: TransportResponse): Promise<ResponseType> {
    throw Error('Should be implemented by subclass.');
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
      timeout: 10000,
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
    return undefined;
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
   * @returns Deserialized data or `undefined` in case of `JSON.parse(..)` error.
   */
  protected deserializeResponse<ServiceResponse>(response: TransportResponse): ServiceResponse | undefined {
    const contentType = response.headers['content-type'];
    if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
      return undefined;

    const json = AbstractRequest.decoder.decode(response.body);

    try {
      const parsedJson = JSON.parse(json);
      return parsedJson as ServiceResponse;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return undefined;
    }
  }
}
