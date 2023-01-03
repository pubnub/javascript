/**       */

import assert from 'assert';
import nock from 'nock';

export default {
  createNock() {
    return nock('http://ps.pndsn.com:80', {
      filteringScope: () => true,
    });
  },
  runAPIWithResponseDelays(scope, statusCode, responseBody, delays, apiCall) {
    let lastRequest = null;

    const callAPIWithDelayedResponse = (previousDelay, delay) =>
      new Promise((resolve) => {
        const scopeWithDelay = scope.delay(-previousDelay).delay(delay).reply(statusCode, responseBody);
        scopeWithDelay.once('request', (request) => {
          lastRequest = request;
        });

        apiCall(() => {
          scopeWithDelay.done();
          resolve();
        });
      });

    let promisesResult = Promise.resolve();
    for (let delayIdx = 0; delayIdx < delays.length; delayIdx += 1) {
      let previousDelay = delayIdx > 0 ? delays[delayIdx - 1] : 0;
      let delay = delays[delayIdx];
      promisesResult = promisesResult.then(() => callAPIWithDelayedResponse(previousDelay, delay));
    }

    return promisesResult.then(() => lastRequest);
  },
  verifyRequestTelemetry(requestPath, latencyKey, expectedLatency, leeway) {
    const re = new RegExp(`${latencyKey}=(\\d+)`, 'i');
    const latencyString = (re.exec(requestPath) ?? [])[1];
    const latency = latencyString ? parseInt(latencyString, 10) : 0;

    assert(
      latency >= expectedLatency && latency <= expectedLatency + leeway,
      `Latency is outside of expected bounds: ${expectedLatency} <= ${latency} <= ${expectedLatency + leeway}`,
    );
  },
};
