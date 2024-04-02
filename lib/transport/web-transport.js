/**
 * Web Transport provider module.
 */
import { PubNubAPIError } from '../errors/pubnub-api-error';
import StatusCategory from '../core/constants/categories';
/**
 * RollUp placeholder.
 */
const WEB_WORKER_PLACEHOLDER = '';
/**
 * Class representing a fetch-based Web Worker transport provider.
 */
export class WebTransport {
    constructor(keepAlive = false, logVerbosity) {
        this.keepAlive = keepAlive;
        this.logVerbosity = logVerbosity;
        this.setupWorker();
    }
    makeSendable(req) {
        let controller;
        const sendRequestEvent = {
            type: 'send-request',
            request: req,
        };
        if (req.cancellable) {
            controller = {
                abort: () => {
                    const cancelRequest = {
                        type: 'cancel-request',
                        identifier: req.identifier,
                    };
                    // Cancel active request with specified identifier.
                    this.worker.postMessage(cancelRequest);
                },
            };
        }
        return [
            new Promise((resolve, reject) => {
                // Associate Promise resolution / reject with request identifier for future usage in
                // `onmessage` handler block to return results.
                this.callbacks.set(req.identifier, { resolve, reject });
                // Trigger request processing by Web Worker.
                this.worker.postMessage(sendRequestEvent);
            }),
            controller,
        ];
    }
    request(req) {
        return req;
    }
    /**
     * Complete PubNub Web Worker setup.
     */
    setupWorker() {
        this.worker = new Worker(WEB_WORKER_PLACEHOLDER, {
            name: '/pubnub',
            type: 'module',
        });
        this.callbacks = new Map();
        // Complete Web Worker initialization.
        const setupEvent = {
            type: 'setup',
            logVerbosity: this.logVerbosity,
            keepAlive: this.keepAlive,
        };
        this.worker.postMessage(setupEvent);
        this.worker.onmessage = (event) => {
            const { data } = event;
            if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
                this.logRequestProgress(data);
            }
            else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
                const { resolve, reject } = this.callbacks.get(data.identifier);
                if (data.type === 'request-process-success') {
                    resolve({
                        status: data.response.status,
                        url: data.url,
                        headers: data.response.headers,
                        body: data.response.body,
                    });
                }
                else {
                    let category = StatusCategory.PNUnknownCategory;
                    let message = 'Unknown error';
                    // Handle client-side issues (if any).
                    if (data.error) {
                        if (data.error.type === 'NETWORK_ISSUE')
                            category = StatusCategory.PNNetworkIssuesCategory;
                        else if (data.error.type === 'TIMEOUT')
                            category = StatusCategory.PNTimeoutCategory;
                        else if (data.error.type === 'ABORTED')
                            category = StatusCategory.PNCancelledCategory;
                        message = `${data.error.message} (${data.identifier})`;
                    }
                    // Handle service error response.
                    else if (data.response) {
                        return reject(PubNubAPIError.create({
                            url: data.url,
                            headers: data.response.headers,
                            body: data.response.body,
                            status: data.response.status,
                        }, data.response.body));
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
    logRequestProgress(information) {
        var _a, _b;
        if (information.type === 'request-progress-start') {
            console.log('<<<<<');
            console.log(`[${information.timestamp}] ${information.url}\n${JSON.stringify((_a = information.query) !== null && _a !== void 0 ? _a : {})}`);
            console.log('-----');
        }
        else {
            console.log('>>>>>>');
            console.log(`[${information.timestamp} / ${information.duration}] ${information.url}\n${JSON.stringify((_b = information.query) !== null && _b !== void 0 ? _b : {})}\n${information.response}`);
            console.log('-----');
        }
    }
}
