/* global describe, it, before, after */

import superagent from 'superagent';
import sinon from 'sinon';
import nock from 'nock';
import assert from 'assert';

import Config from '../../src/core/components/config';
import Networking from '../../src/networking';
import { del, get, post } from '../../src/networking/modules/web-node';
import { keepAlive, proxy } from '../../src/networking/modules/node';

describe('getStandardOrigin', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  describe('if useDomainSharding is unset', () => {
    it('shouldn\'t generate sharded domains based on custom origin', () => {
      const config = new Config({ setup: { ssl: true, origin: 'example.pubnubapi.com' } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      assert.equal(origin, "https://example.pubnubapi.com");    
    });

    it('should generate sharded domains based on default origin', () => {
      const config = new Config({ setup: { ssl: true } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      const regex = /^https:\/\/ps([0-9](0)?)\.pndsn\.com$/;

      assert(regex.test(origin), `"${origin}" doesn't match the regex ${regex}`);
    });
  });

  describe('if useDomainSharding is set to false', () => {
    it('shouldn\'t generate sharded domains based on custom origin', () => {
      const config = new Config({ setup: { ssl: true, origin: 'example.pubnubapi.com', useDomainSharding: false } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      assert.equal(origin, 'https://example.pubnubapi.com');
    });

    it('shouldn\'t generate sharded domains based on default origin', () => {
      const config = new Config({ setup: { ssl: true, useDomainSharding: false } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      assert.equal(origin, 'https://ps.pndsn.com');
    });
  });

  describe('if useDomainSharding is set to true', () => {
    it('should generate sharded domains based on custom origin', () => {
      const config = new Config({ setup: { ssl: true, origin: 'example.pubnubapi.com', useDomainSharding: true } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      const regex = /^https:\/\/example\-([0-9](0)?)\.pubnubapi\.com$/;

      assert(regex.test(origin), `"${origin}" doesn't match the regex ${regex}`);
    });

    it('should generate sharded domains based on default origin', () => {
      const config = new Config({ setup: { ssl: true, useDomainSharding: true } })
      const networking = new Networking({})
      networking.init(config);

      const origin = networking.getStandardOrigin();

      const regex = /^https:\/\/ps([0-9](0)?)\.pndsn\.com$/;

      assert(regex.test(origin), `"${origin}" doesn't match the regex ${regex}`);
    });
  })

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
