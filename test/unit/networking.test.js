/* global describe, it, before, after */

import superagent from 'superagent';
import sinon from 'sinon';
import nock from 'nock';
import assert from 'assert';

import Networking from '../../src/networking';
import { del, get, post } from '../../src/networking/modules/web-node';
import { keepAlive, proxy } from '../../src/networking/modules/node';

describe('keep-alive agent', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  const setupNetwork = (shouldSecure, enableKeepAlive) => {
    const config = { origin: 'ps.pndsn.com', secure: shouldSecure, keepAlive: enableKeepAlive, logVerbosity: false };
    const networking = new Networking({ keepAlive, del, get, post, proxy });
    networking.init(config);

    return networking;
  };

  it('should not create if \'keepAlive\' is \'false\'', () => {
    const networking = setupNetwork(false, false);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0' }, () => {});
    assert(superagentGetSpy.called, 'superagent not called with get');
    assert(superagentGetSpy.returnValues[0], 'request instance not created');
    assert(!superagentGetSpy.returnValues[0]._agent, 'keep-alive agent should not be created');

    superagentGetSpy.restore();
  });

  it('should create agent for insecure connection', () => {
    const networking = setupNetwork(false, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0' }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent, 'keep-alive agent not created');
    assert(superagentGetSpy.returnValues[0]._agent.defaultPort !== 443, 'keep-alive agent should access TLS (80) port');

    superagentGetSpy.restore();
  });

  it('should re-use created agent for insecure connection', () => {
    const networking = setupNetwork(false, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0' }, () => {});
    networking.GET({}, { url: '/time/0' }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent === superagentGetSpy.returnValues[1]._agent, 'same user-agent should be used');

    superagentGetSpy.restore();
  });

  it('should create agent for secure connection', () => {
    const networking = setupNetwork(true, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0' }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent, 'keep-alive agent not created');
    assert(superagentGetSpy.returnValues[0]._agent.defaultPort === 443, 'keep-alive agent should access SSL (443) port');

    superagentGetSpy.restore();
  });

  it('should re-use created agent for secure connection', () => {
    const networking = setupNetwork(true, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0' }, () => {});
    networking.GET({}, { url: '/time/0' }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent === superagentGetSpy.returnValues[1]._agent, 'same user-agent should be used');

    superagentGetSpy.restore();
  });
});
