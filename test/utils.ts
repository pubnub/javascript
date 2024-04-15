/**       */

import nock, { Interceptor } from 'nock';

import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
import chai from 'chai';

import { Query } from '../src/core/types/api';

chai.use(chaiAsPromised);
chai.use(chaiNock);

process.env.NODE_ENV = 'test';

export default {
  createNock() {
    return nock('https://ps.pndsn.com', {
      filteringScope: (scope) => /ps\d*\.pndsn\.com/.test(scope),
      // allowUnmocked: true,
    });
  },
  runAPIWithResponseDelays(
    scope: Interceptor,
    statusCode: number,
    responseBody: string,
    delays: number[],
    apiCall: (completion: () => void) => void,
  ) {
    let lastRequest: null = null;

    const callAPIWithDelayedResponse = (previousDelay: number, delay: number) =>
      new Promise((resolve) => {
        const scopeWithDelay = scope
          .delay(-previousDelay)
          .delay(delay)
          .reply(statusCode, responseBody, { 'content-type': 'text/javascript' });
        scopeWithDelay.once('request', (request) => {
          lastRequest = request;
        });

        apiCall(() => {
          scopeWithDelay.done();
          resolve(undefined);
        });
      });

    let promisesResult = Promise.resolve();
    for (let delayIdx = 0; delayIdx < delays.length; delayIdx += 1) {
      let previousDelay = delayIdx > 0 ? delays[delayIdx - 1] : 0;
      let delay = delays[delayIdx];
      promisesResult = promisesResult.then(() => callAPIWithDelayedResponse(previousDelay, delay)) as Promise<void>;
    }

    return promisesResult.then(() => lastRequest);
  },
  matchQuery(actualQuery: Query, targetQuery: Query, excludeRequestId: boolean = true): boolean {
    const actualKeys = Object.keys(actualQuery).filter((key) => key !== 'requestid' || !excludeRequestId);
    const targetKeys = Object.keys(targetQuery);

    if (actualKeys.length !== targetKeys.length) return false;

    for (const key of targetKeys) if (actualQuery[key] !== targetQuery[key]) return false;

    return true;
  },
};
