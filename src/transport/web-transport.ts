/**
 * Web Transport provider module.
 */

import { CancellationController, TransportRequest } from '../core/types/transport-request';
import { TransportResponse } from '../core/types/transport-response';
import { PubNubAPIError } from '../errors/pubnub-api-error';
import StatusCategory from '../core/constants/categories';
import { Transport } from '../core/interfaces/transport';
import * as PubNubWebWorker from './web-worker';

/**
 * RollUp placeholder.
 */
const WEB_WORKER_PLACEHOLDER: string = '';

/**
 * Class representing a fetch-based Web Worker transport provider.
 */
export class WebTransport implements Transport {
  /**
   * Scheduled requests result handling callback.
   */
  callbacks?: Map<string, { resolve: (value: TransportResponse) => void; reject: (value: Error) => void }>;

  /**
   * Spawned Web Worker.
   */
  worker?: Worker;

  constructor(
    private keepAlive: boolean = false,
    private readonly logVerbosity: boolean,
  ) {
    this.setupWorker();
  }

  makeSendable(req: TransportRequest): [Promise<TransportResponse>, CancellationController | undefined] {
    let controller: CancellationController | undefined;
    const sendRequestEvent: PubNubWebWorker.SendRequestEvent = {
      type: 'send-request',
      request: req,
    };

    if (req.cancellable) {
      controller = {
        abort: () => {
          const cancelRequest: PubNubWebWorker.CancelRequestEvent = {
            type: 'cancel-request',
            identifier: req.identifier,
          };

          // Cancel active request with specified identifier.
          this.worker!.postMessage(cancelRequest);
        },
      };
    }

    return [
      new Promise((resolve, reject) => {
        // Associate Promise resolution / reject with request identifier for future usage in
        // `onmessage` handler block to return results.
        this.callbacks!.set(req.identifier, { resolve, reject });

        // Trigger request processing by Web Worker.
        this.worker!.postMessage(sendRequestEvent);
      }),
      controller,
    ];
  }

  request(req: TransportRequest): TransportRequest {
    return req;
  }

  /**
   * Complete PubNub Web Worker setup.
   */
  private setupWorker() {
    this.worker = new Worker(
      URL.createObjectURL(new Blob([WEB_WORKER_PLACEHOLDER], { type: 'application/javascript' })),
      {
        name: '/pubnub',
        type: 'module',
      },
    );
    this.callbacks = new Map();

    // Complete Web Worker initialization.
    const setupEvent: PubNubWebWorker.SetupEvent = {
      type: 'setup',
      logVerbosity: this.logVerbosity,
      keepAlive: this.keepAlive,
    };
    this.worker.postMessage(setupEvent);

    this.worker.onmessage = (event: MessageEvent<PubNubWebWorker.PubNubWebWorkerEvent>) => {
      const { data } = event;
      if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
        this.logRequestProgress(data);
      } else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
        const { resolve, reject } = this.callbacks!.get(data.identifier)!;

        if (data.type === 'request-process-success') {
          resolve({
            status: data.response.status,
            url: data.url,
            headers: data.response.headers,
            body: data.response.body,
          });
        } else {
          let category: StatusCategory = StatusCategory.PNUnknownCategory;
          let message = 'Unknown error';

          // Handle client-side issues (if any).
          if (data.error) {
            if (data.error.type === 'NETWORK_ISSUE') category = StatusCategory.PNNetworkIssuesCategory;
            else if (data.error.type === 'TIMEOUT') category = StatusCategory.PNTimeoutCategory;
            message = data.error.message;
          }
          // Handle service error response.
          else if (data.response) {
            return reject(
              PubNubAPIError.create(
                {
                  url: data.url,
                  headers: data.response.headers,
                  body: data.response.body,
                  status: data.response.status,
                },
                data.response.body,
              ),
            );
          }

          reject(new PubNubAPIError(message, category, 0, new Error(message)));
        }
      }
    };
  }

  /**
   * Print request progress information.
   *
   * @param information - Request progress information from Web Worker.
   */
  private logRequestProgress(information: PubNubWebWorker.RequestSendingProgress) {
    if (information.type === 'request-progress-start') {
      console.log('<<<<<');
      console.log(`[${information.timestamp}]`, '\n', information.url, '\n', JSON.stringify(information.query ?? {}));
      console.log('-----');
    } else {
      console.log('>>>>>>');
      console.log(
        `[${information.timestamp} / ${information.duration}]`,
        '\n',
        information.url,
        '\n',
        JSON.stringify(information.query ?? {}),
        '\n',
        information.response,
      );
      console.log('-----');
    }
  }
}
