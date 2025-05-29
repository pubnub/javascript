/**
 * Common PubNub Network Provider middleware module.
 *
 * @internal
 */

import { CancellationController, TransportMethod, TransportRequest } from '../core/types/transport-request';
import { PrivateClientConfiguration } from '../core/interfaces/configuration';
import { TransportResponse } from '../core/types/transport-response';
import { LoggerManager } from '../core/components/logger-manager';
import { TokenManager } from '../core/components/token_manager';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import StatusCategory from '../core/constants/categories';
import { Transport } from '../core/interfaces/transport';
import { encodeString } from '../core/utils';
import { Query } from '../core/types/api';

/**
 * Transport middleware configuration options.
 *
 * @internal
 */
type PubNubMiddlewareConfiguration = {
  /**
   * Private client configuration.
   */
  clientConfiguration: PrivateClientConfiguration;

  /**
   * REST API endpoints access tokens manager.
   */
  tokenManager?: TokenManager;

  /**
   * HMAC-SHA256 hash generator from provided `data`.
   */
  shaHMAC?: (data: string) => string;

  /**
   * Platform-specific transport for requests processing.
   */
  transport: Transport;
};

/**
 * Request signature generator.
 *
 * @internal
 */
class RequestSignature {
  private static textDecoder = new TextDecoder('utf-8');
  constructor(
    private publishKey: string,
    private secretKey: string,
    private hasher: (input: string, secret: string) => string,
    private logger: LoggerManager,
  ) {}

  /**
   * Compute request signature.
   *
   * @param req - Request which will be used to compute signature.
   * @returns {string} `v2` request signature.
   */
  public signature(req: TransportRequest): string {
    const method = req.path.startsWith('/publish') ? TransportMethod.GET : req.method;

    let signatureInput = `${method}\n${this.publishKey}\n${req.path}\n${this.queryParameters(req.queryParameters!)}\n`;
    if (method === TransportMethod.POST || method === TransportMethod.PATCH) {
      const body = req.body;
      let payload: string | undefined;

      if (body && body instanceof ArrayBuffer) {
        payload = RequestSignature.textDecoder.decode(body);
      } else if (body && typeof body !== 'object') {
        payload = body;
      }

      if (payload) signatureInput += payload;
    }

    this.logger.trace(this.constructor.name, () => ({
      messageType: 'text',
      message: `Request signature input:\n${signatureInput}`,
    }));

    return `v2.${this.hasher(signatureInput, this.secretKey)}`
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Prepare request query parameters for signature.
   *
   * @param query - Key / value pair of the request query parameters.
   * @private
   */
  private queryParameters(query: Query) {
    return Object.keys(query)
      .sort()
      .map((key) => {
        const queryValue = query[key];
        if (!Array.isArray(queryValue)) return `${key}=${encodeString(queryValue)}`;

        return queryValue
          .sort()
          .map((value) => `${key}=${encodeString(value)}`)
          .join('&');
      })
      .join('&');
  }
}

/**
 * Common PubNub Network Provider middleware.
 *
 * @internal
 */
export class PubNubMiddleware implements Transport {
  /**
   * Request signature generator.
   */
  signatureGenerator?: RequestSignature;

  constructor(private configuration: PubNubMiddlewareConfiguration) {
    const {
      clientConfiguration: { keySet },
      shaHMAC,
    } = configuration;

    if (process.env.CRYPTO_MODULE !== 'disabled') {
      if (keySet.secretKey && shaHMAC)
        this.signatureGenerator = new RequestSignature(keySet.publishKey!, keySet.secretKey, shaHMAC, this.logger);
    }
  }

  /**
   * Retrieve registered loggers' manager.
   *
   * @returns Registered loggers' manager.
   */
  private get logger(): LoggerManager {
    return this.configuration.clientConfiguration.logger();
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    const retryPolicy = this.configuration.clientConfiguration.retryConfiguration;
    const transport = this.configuration.transport;

    // Make requests retryable.
    if (retryPolicy !== undefined) {
      let retryTimeout: ReturnType<typeof setTimeout> | undefined;
      let activeCancellation: CancellationController | undefined;
      let canceled = false;
      let attempt = 0;

      const cancellation: CancellationController = {
        abort: (reason) => {
          canceled = true;
          if (retryTimeout) clearTimeout(retryTimeout);
          if (activeCancellation) activeCancellation.abort(reason);
        },
      };

      const retryableRequest = new Promise<TransportResponse>((resolve, reject) => {
        const trySendRequest = () => {
          // Check whether the request already has been canceled and there is no retry should proceed.
          if (canceled) return;

          const [attemptPromise, attemptCancellation] = transport.makeSendable(this.request(req));
          activeCancellation = attemptCancellation;

          const responseHandler = (res?: TransportResponse, error?: PubNubAPIError) => {
            const retriableError = error ? error.category !== StatusCategory.PNCancelledCategory : true;
            const retriableStatusCode = !res || res.status >= 400;
            let delay = -1;

            if (
              retriableError &&
              retriableStatusCode &&
              retryPolicy.shouldRetry(req, res, error?.category, attempt + 1)
            )
              delay = retryPolicy.getDelay(attempt, res);

            if (delay > 0) {
              attempt++;
              this.logger.warn(this.constructor.name, `HTTP request retry #${attempt} in ${delay}ms.`);
              retryTimeout = setTimeout(() => trySendRequest(), delay);
            } else {
              if (res) resolve(res);
              else if (error) reject(error);
            }
          };

          attemptPromise
            .then((res) => responseHandler(res))
            .catch((err: PubNubAPIError) => responseHandler(undefined, err));
        };

        trySendRequest();
      });

      return [retryableRequest, activeCancellation ? cancellation : undefined];
    }

    return transport.makeSendable(this.request(req));
  }

  request(req: TransportRequest): TransportRequest {
    const { clientConfiguration } = this.configuration;

    // Get request patched by transport provider.
    req = this.configuration.transport.request(req);
    if (!req.queryParameters) req.queryParameters = {};

    // Modify the request with required information.
    if (clientConfiguration.useInstanceId) req.queryParameters['instanceid'] = clientConfiguration.getInstanceId()!;
    if (!req.queryParameters['uuid']) req.queryParameters['uuid'] = clientConfiguration.userId!;
    if (clientConfiguration.useRequestId) req.queryParameters['requestid'] = req.identifier;
    req.queryParameters['pnsdk'] = this.generatePNSDK();
    req.origin ??= clientConfiguration.origin as string;

    // Authenticate request if required.
    this.authenticateRequest(req);

    // Sign request if it is required.
    this.signRequest(req);

    return req;
  }

  private authenticateRequest(req: TransportRequest) {
    // Access management endpoints don't need authentication (signature required instead).
    if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time')) return;

    const { clientConfiguration, tokenManager } = this.configuration;
    const accessKey = (tokenManager && tokenManager.getToken()) ?? clientConfiguration.authKey;
    if (accessKey) req.queryParameters!['auth'] = accessKey;
  }

  /**
   * Compute and append request signature.
   *
   * @param req - Transport request with information which should be used to generate signature.
   */
  private signRequest(req: TransportRequest) {
    if (!this.signatureGenerator || req.path.startsWith('/time')) return;

    req.queryParameters!['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
    req.queryParameters!['signature'] = this.signatureGenerator.signature(req);
  }

  /**
   * Compose `pnsdk` query parameter.
   *
   * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
   * parameter.
   *
   * @returns Finalized `pnsdk` query parameter value.
   */
  private generatePNSDK() {
    const { clientConfiguration } = this.configuration;
    if (clientConfiguration.sdkName) return clientConfiguration.sdkName;

    let base = `PubNub-JS-${clientConfiguration.sdkFamily}`;
    if (clientConfiguration.partnerId) base += `-${clientConfiguration.partnerId}`;
    base += `/${clientConfiguration.getVersion()}`;

    const pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
    if (pnsdkSuffix.length > 0) base += pnsdkSuffix;

    return base;
  }
}
