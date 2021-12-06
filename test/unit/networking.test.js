/* global describe, it, before, after */

import superagent from 'superagent';
import sinon from 'sinon';
import nock from 'nock';
import assert from 'assert';

import Config from '../../src/core/components/config';
import Networking from '../../src/networking';
import { del, get, post } from '../../src/networking/modules/web-node';
import { keepAlive, proxy } from '../../src/networking/modules/node';

describe('multiple origins', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  it('should use a random origin from a supplied array of origins', () => {
    const origins = ['test1.example.com', 'test2.example.com']; 
    const config = new Config({ setup: { ssl: true, origin: origins } })
    const networking = new Networking({});
    networking.init(config);

    const origin = networking.getStandardOrigin();

    assert(origins.some((e) => `https://${e}` === origin), `Supplied origins do not contain "${origin}"`); 
  });

  it('should use string origin if a string is supplied', () => {
    const config = new Config({ setup: { ssl: true, origin: 'example.com' } })
    const networking = new Networking({});
    networking.init(config);

    const origin = networking.getStandardOrigin();

    assert.equal(origin, 'https://example.com');
  });

  describe('shiftStandardOrigin', () => {
    it('should use all origins if array is supplied', () => {
      const origins = ['test1.example.com', 'test2.example.com']; 
      const config = new Config({ setup: { ssl: true, origin: origins } })
      const networking = new Networking({});
      networking.init(config);

      const firstOrigin = networking.getStandardOrigin();
      const secondOrigin = networking.shiftStandardOrigin();
      const thirdOrigin = networking.shiftStandardOrigin();

      assert.equal(firstOrigin, thirdOrigin);
      assert.notEqual(firstOrigin, secondOrigin);
    });

    it('should do nothing if string is supplied', () => { 
      const config = new Config({ setup: { ssl: true, origin: 'example.com' } })
      const networking = new Networking({});
      networking.init(config);

      const firstOrigin = networking.getStandardOrigin();
      const secondOrigin = networking.shiftStandardOrigin();
      const thirdOrigin = networking.shiftStandardOrigin();

      assert.equal(firstOrigin, secondOrigin);
      assert.equal(secondOrigin, thirdOrigin);
      assert.equal(thirdOrigin, firstOrigin);
    });
  });
});

describe('keep-alive agent', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  const setupNetwork = (shouldSecure, enableKeepAlive) => {
    const config = new Config({ setup: { origin: 'ps.pndsn.com', ssl: shouldSecure, keepAlive: enableKeepAlive, logVerbosity: false } });
    const networking = new Networking({ keepAlive, del, get, post, proxy });
    networking.init(config);

    return networking;
  };

  it('should not create if \'keepAlive\' is \'false\'', () => {
    const networking = setupNetwork(false, false);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    assert(superagentGetSpy.called, 'superagent not called with get');
    assert(superagentGetSpy.returnValues[0], 'request instance not created');
    assert(!superagentGetSpy.returnValues[0]._agent, 'keep-alive agent should not be created');

    superagentGetSpy.restore();
  });

  it('should create agent for insecure connection', () => {
    const networking = setupNetwork(false, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent, 'keep-alive agent not created');
    assert(superagentGetSpy.returnValues[0]._agent.defaultPort !== 443, 'keep-alive agent should access TLS (80) port');

    superagentGetSpy.restore();
  });

  it('should re-use created agent for insecure connection', () => {
    const networking = setupNetwork(false, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent === superagentGetSpy.returnValues[1]._agent, 'same user-agent should be used');

    superagentGetSpy.restore();
  });

  it('should create agent for secure connection', () => {
    const networking = setupNetwork(true, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent, 'keep-alive agent not created');
    assert(superagentGetSpy.returnValues[0]._agent.defaultPort === 443, 'keep-alive agent should access SSL (443) port');

    superagentGetSpy.restore();
  });

  it('should re-use created agent for secure connection', () => {
    const networking = setupNetwork(true, true);
    const superagentGetSpy = sinon.spy(superagent, 'get');

    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    networking.GET({}, { url: '/time/0', headers: {} }, () => {});
    assert(superagentGetSpy.returnValues[0]._agent === superagentGetSpy.returnValues[1]._agent, 'same user-agent should be used');

    superagentGetSpy.restore();
  });
});
