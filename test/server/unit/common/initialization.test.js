/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

// temp integration test while core is still complex
describe('core initalization', () => {
  it('passes the correct arguments to the config class', () => {
    const setupConfig = {
      subscribe_key: 'subKey',
      publish_key: 'publishKey',
      auth_key: 'authKey',
      origin: 'customOrigin.origin.com',
      ssl: true,
      instance_id: 'instanceIdConfig',
      use_request_id: 'requestIdConfig',
      xdr: function () {}
    };

    let proxiedCore = proxyquire('../../../../core/src/pubnub-common.js', {
      './components/config': class {
        setInstanceIdConfig(config) {
          assert(config, 'instanceIdConfig');
          return this;
        }

        setRequestIdConfig(config) {
          assert(config, 'requestIdConfig');
          return this;
        }

        isInstanceIdEnabled() { return false; }

      }
    });

    proxiedCore.PN_API(setupConfig);
  });

  it('passes the correct arguments to the networking class', () => {
    const setupConfig = {
      subscribe_key: 'subKey',
      publish_key: 'publishKey',
      auth_key: 'authKey',
      origin: 'customOrigin.origin.com',
      ssl: true,
      xdr: function () {}
    };

    let proxiedCore = proxyquire('../../../../core/src/pubnub-common.js', {
      './components/networking': class {
        constructor(xhr, keychain, ssl, domain) {
          assert.equal(keychain.getAuthKey(), setupConfig.auth_key);
          assert.equal(keychain.getPublishKey(), setupConfig.publish_key);
          assert.equal(keychain.getSubscribeKey(), setupConfig.subscribe_key);
          assert.equal(ssl, setupConfig.ssl);
          assert.equal(domain, 'customOrigin.origin.com');
        }
        fetchTime() {}
      }
    });

    proxiedCore.PN_API(setupConfig);
  });
});
