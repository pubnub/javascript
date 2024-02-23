import { Transport } from '../core/interfaces/transport';
import { TransportMethod, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import uuidGenerator from '../core/components/uuid';
import { encodeString } from '../core/utils';

// Current SDK version.
const PUBNUB_SDK_VERSION = '7.5.0';

type PubNubMiddlewareConfiguration = {
  userId: string;
  authKey?: string;
  accessToken?: string;

  /**
   * Whether or not to include the PubNub object instance ID in outgoing requests.
   */
  useInstanceId: boolean;

  /**
   * Unique PubNub client instance identifier.
   */
  instanceId: string;

  /**
   * PubNub service origin which should be for REST API calls.
   */
  origin: string;

  /**
   * Platform-specific transport for requests processing.
   */
  transport: Transport;

  /**
   * Track of the SDK family for identifier generator.
   */
  sdkFamily: string;

  /**
   * If the SDK is running as part of another SDK built atop of it, allow a custom pnsdk with
   * name and version.
   */
  sdkName: string;

  /**
   * If the SDK is operated by a partner, allow a custom pnsdk item for them.
   */
  partnerId?: string;
};

export class RequestSignature {
  private static textDecoder = new TextDecoder('utf-8');
  constructor(
    private publishKey: string,
    private secretKey: string,
    private hasher: (input: string, secret: string) => string,
  ) {}

  /**
   * Compute request signature.
   *
   * @param req - Request which will be used to compute signature.
   * @returns {string} `v2` request signature.
   */
  public signature(req: TransportRequest): string {
    const method = req.path.startsWith('/publish') ? TransportMethod.GET : req.method;

    let signatureInput = `${method}\n${this.publishKey}\n${req.path}\n${this.queryParameters(req.queryParameters)}\n`;
    if (method === TransportMethod.POST || method === TransportMethod.PATCH) {
      const body = req.body;
      let payload: string | undefined;

      if (body && body instanceof ArrayBuffer) {
        payload = RequestSignature.textDecoder.decode(body);
      } else if (body) {
        payload = body;
      }

      if (payload) signatureInput += payload;
    }

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
  private queryParameters(query: Record<string, string> = {}) {
    return Object.keys(query)
      .sort()
      .map((key) => `${key}=${encodeString(query[key])}`)
      .join('&');
  }
}

export class PubNubMiddleware implements Transport {
  constructor(private configuration: PubNubMiddlewareConfiguration) {}

  async send(req: TransportRequest): Promise<TransportResponse> {
    if (!req.queryParameters) req.queryParameters = {};

    // Modify request with required information.
    req.queryParameters['uuid'] = this.configuration.userId;
    req.queryParameters['requestid'] = uuidGenerator.createUUID();
    if (this.configuration.useInstanceId) req.queryParameters['instanceid'] = this.configuration.instanceId;
    req.queryParameters['pnsdk'] = this.generatePNSDK();

    // Authenticate request if required.
    this.authenticateRequest(req);

    // Sign request if it is required.
    this.signRequest(req);

    return this.configuration.transport.send(req);
  }

  private authenticateRequest(req: TransportRequest) {
    if (!req.path.startsWith('/v2/auth/') && !req.path.startsWith('/v3/pam/')) return;
    if (!req.queryParameters) req.queryParameters = {};

    const accessKey = this.configuration.accessToken ?? this.configuration.authKey;
    if (accessKey) req.queryParameters['auth'] = accessKey;
  }

  private signRequest(req: TransportRequest) {
    if (!req.queryParameters) req.queryParameters = {};

    req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
    // TODO: ADD CALL TO THE SIGNATURE
    req.queryParameters['signature'] = 'dfff';
  }

  private generatePNSDK() {
    if (this.configuration.sdkName) return this.configuration.sdkName;

    let base = `PubNub-JS-${this.configuration.sdkFamily}`;
    if (this.configuration.partnerId) base += `-${this.configuration.partnerId}`;
    base += `/${PUBNUB_SDK_VERSION}`;

    const pnsdkSuffix = config._getPnsdkSuffix(' ');
    if (pnsdkSuffix.length > 0) base += pnsdkSuffix;

    return base;
  }
}
