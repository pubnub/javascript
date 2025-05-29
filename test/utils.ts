/**       */

import nock, { Interceptor } from 'nock';

import chaiAsPromised from 'chai-as-promised';
import chaiNock from 'chai-nock';
import chai from 'chai';

import { adjustedTimetokenBy } from '../src/core/utils';
import { Query } from '../src/core/types/api';
import { Payload } from '../lib/types';

chai.use(chaiAsPromised);
chai.use(chaiNock);

process.env.NODE_ENV = 'test';

const PRINT_MOCKED_SCOPES = false;

export default {
  createNock() {
    return nock('https://ps.pndsn.com', {
      filteringScope: (scope) => /ps\d*\.pndsn\.com/.test(scope),
      // allowUnmocked: true,
    });
  },

  createPresenceMockScopes(parameters: {
    subKey: string;
    presenceType: 'heartbeat' | 'leave';
    requests: { channels?: string[]; groups?: string[]; query?: Query }[];
  }) {
    const replyDelay = 50;
    return parameters.requests.map((request) => {
      const channels = request.channels ? request.channels.join(',') : ',';
      const groups = request.groups ? request.groups.join(',') : undefined;
      let query: Query | boolean = true;

      if (groups) {
        if (!request.query) query = { 'channel-group': groups };
        else request.query['channel-group'] = groups;
      } else if (request.query) query = request.query;

      if (PRINT_MOCKED_SCOPES) {
        console.log(
          `MOCKED: /v2/presence/sub-key/${parameters.subKey}/channel/${channels}/${parameters.presenceType}`,
          typeof query === 'boolean' ? query : { ...query },
        );
      }

      return this.createNock()
        .get(`/v2/presence/sub-key/${parameters.subKey}/channel/${channels}/${parameters.presenceType}`)
        .query((queryParameter) => {
          if (typeof query === 'boolean') return true;
          return Object.keys(query).every((key) => (queryParameter as Query)[key] === (query as Query)[key]);
        })
        .delay(replyDelay)
        .reply(200, { message: 'OK', service: 'Presence', status: 200 }, { 'content-type': 'text/javascript' });
    });
  },
  createSubscribeMockScopes(parameters: {
    subKey: string;
    userId: string;
    eventEngine?: boolean;
    pnsdk: string;
    requests: {
      channels?: string[];
      groups?: string[];
      query?: Query;
      messages?: {
        channel: string;
        group?: string;
        message?: Payload;
        customMessageType?: string;
        type?: number;
        presenceAction?: string;
        presenceUserId?: string;
        presenceOccupancy?: number;
        timetokenAdjust?: string;
      }[];
      timetoken?: string;
      replyDelay?: number;
    }[];
  }) {
    const replyDelay = 180;
    const initialTimetoken = `${Date.now()}0000`;
    let initialResponseCreated = false;
    const mockScopes: nock.Scope[] = [];
    let previousTimetoken = '0';
    let previousChannels = '';
    const timetokens: string[] = [];

    parameters.requests.forEach((request) => {
      const channels = request.channels ? request.channels.join(',') : ',';
      const groups = request.groups ? request.groups.join(',') : undefined;
      const url = `/v2/subscribe/${parameters.subKey}/${channels}/0`;
      const headers = { 'content-type': 'text/javascript' };
      const query: Query = request.query ?? {};
      const actualDelay = request.replyDelay ?? replyDelay;

      if (request.timetoken) query.tt = request.timetoken;
      if (groups && !query['channel-group']) query['channel-group'] = groups;
      if (parameters.pnsdk && !query.pnsdk) query.pnsdk = parameters.pnsdk;
      if (parameters.userId && !query.uuid) query.uuid = parameters.userId;
      if (parameters.eventEngine) query.ee = '';

      let responseBody: Record<string, unknown> = {};

      if (!initialResponseCreated) {
        responseBody = { t: { t: initialTimetoken, r: 1 }, m: [] };
        mockScopes.push(
          this.createNock()
            .get(url)
            .query({ ...query })
            .delay(actualDelay)
            .reply(200, responseBody, headers),
        );
        previousTimetoken = initialTimetoken;
        initialResponseCreated = true;
        previousChannels = channels;
        timetokens.push(previousTimetoken);

        if (PRINT_MOCKED_SCOPES) console.log(`MOCKED: ${url}`, { ...query });
      }

      // Change of the channel list means that the next request should catch up using timetoken from the previous
      // response.
      if (previousChannels !== channels) {
        timetokens.pop();
        previousTimetoken = timetokens[timetokens.length - 1];
      }

      if (!request.timetoken) query.tt = previousTimetoken;
      query.tr = '1';

      if (PRINT_MOCKED_SCOPES) console.log(`MOCKED: ${url}`, query);

      const currentTimetoken: Record<string, string> = {};
      const messages = (request.messages ?? []).map((message) => {
        if (!currentTimetoken[message.channel]) currentTimetoken[message.channel] = previousTimetoken;
        const increment = !message.timetokenAdjust || !message.timetokenAdjust.startsWith('-');
        const timetokenChangeValue = !message.timetokenAdjust ? '2500000' : message.timetokenAdjust.replace('-', '');
        currentTimetoken[message.channel] = adjustedTimetokenBy(
          currentTimetoken[message.channel],
          timetokenChangeValue,
          increment,
        );

        let metadata: Payload | undefined;
        let payload: Payload;
        if (message.presenceAction) {
          const preciseTimetoken = currentTimetoken[message.channel].slice(0, -4);
          metadata = {
            pn_action: message.presenceAction,
            pn_uuid: message.presenceUserId ?? parameters.userId,
            pn_timestamp: Number(preciseTimetoken.slice(0, -3)),
            pn_precise_timestamp: Number(preciseTimetoken),
            pn_occupancy: message.presenceOccupancy ?? 1,
            pn_ispresence: 1,
            pn_channel: message.channel,
          };

          payload = {
            action: metadata.pn_action,
            uuid: metadata.pn_uuid,
            timestamp: metadata.pn_timestamp,
            precise_timestamp: metadata.pn_precise_timestamp,
            occupancy: metadata.pn_occupancy,
          };
        } else payload = message.message ?? {};

        return {
          a: 3,
          f: 514,
          i: 'demo',
          p: { t: currentTimetoken[message.channel], r: 33 },
          k: parameters.subKey,
          c: message.channel,
          ...(message.group ? { b: message.group } : {}),
          ...(metadata ? { u: metadata } : {}),
          d: payload,
          ...(message.type ? { e: message.type } : {}),
          ...(message.customMessageType ? { cmt: message.customMessageType } : {}),
        };
      });

      if (messages.length === 0) previousTimetoken = adjustedTimetokenBy(previousTimetoken, '1', true);
      else previousTimetoken = adjustedTimetokenBy(Object.values(currentTimetoken).sort().pop()!, '1', true);
      previousChannels = channels;

      responseBody = { t: { t: previousTimetoken, r: 1 }, m: messages };
      mockScopes.push(this.createNock().get(url).query(query).delay(actualDelay).reply(200, responseBody, headers));
      timetokens.push(previousTimetoken);
    });

    return mockScopes;
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
      const previousDelay = delayIdx > 0 ? delays[delayIdx - 1] : 0;
      const delay = delays[delayIdx];
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
