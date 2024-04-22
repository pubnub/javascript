import { setWorldConstructor, setDefaultTimeout, World } from '@cucumber/cucumber';
import PubNub from '../../lib/node/index.js';
import { loadFixtureFile, getFilePath } from './utils';
import * as http from 'http';

interface State {
  pubnub?: any;
}

const state: State = {
  pubnub: undefined,
};

setDefaultTimeout(20 * 1000);
class PubnubWorld extends World {
  settings = {
    checkContractExpectations: true,
    contractServer: 'localhost:8090',
  };
  fileFixtures: Record<string, any> = {};
  fixtures = {
    // bronze config
    // defaultConfig: {
    //   origin: 'balancer-bronze1.aws-pdx-1.ps.pn',
    //   ssl: false,
    //   suppressLeaveEvents: true,
    //   logVerbosity: true
    // },
    // local contract server config
    defaultConfig: {
      origin: 'localhost:8090',
      ssl: false,
      suppressLeaveEvents: true,
      logVerbosity: false,
      uuid: 'myUUID',
    },
    demoKeyset: {
      publishKey: 'demo',
      subscribeKey: 'demo',
    },
    accessManagerKeyset: {
      publishKey: process.env.PAM_PUBLISH_KEY || 'pub-key',
      subscribeKey: process.env.PAM_SUBSCRIBE_KEY || 'sub-key',
      secretKey: process.env.PAM_SECRET_KEY || 'secret-key',
    },
    accessManagerWithoutSecretKeyKeyset: {
      publishKey: process.env.PAM_PUBLISH_KEY || 'pub-key',
      subscribeKey: process.env.PAM_SUBSCRIBE_KEY || 'sub-key',
    },
    tokenWithKnownAuthorizedUUID:
      'qEF2AkF0GmEI03xDdHRsGDxDcmVzpURjaGFuoWljaGFubmVsLTEY70NncnChb2NoYW5uZWxfZ3JvdXAtMQVDdXNyoENzcGOgRHV1aWShZnV1aWQtMRhoQ3BhdKVEY2hhbqFtXmNoYW5uZWwtXFMqJBjvQ2dycKF0XjpjaGFubmVsX2dyb3VwLVxTKiQFQ3VzcqBDc3BjoER1dWlkoWpedXVpZC1cUyokGGhEbWV0YaBEdXVpZHR0ZXN0LWF1dGhvcml6ZWQtdXVpZENzaWdYIPpU-vCe9rkpYs87YUrFNWkyNq8CVvmKwEjVinnDrJJc',
    tokenWithUUIDResourcePermissions:
      'qEF2AkF0GmEI03xDdHRsGDxDcmVzpURjaGFuoWljaGFubmVsLTEY70NncnChb2NoYW5uZWxfZ3JvdXAtMQVDdXNyoENzcGOgRHV1aWShZnV1aWQtMRhoQ3BhdKVEY2hhbqFtXmNoYW5uZWwtXFMqJBjvQ2dycKF0XjpjaGFubmVsX2dyb3VwLVxTKiQFQ3VzcqBDc3BjoER1dWlkoWpedXVpZC1cUyokGGhEbWV0YaBEdXVpZHR0ZXN0LWF1dGhvcml6ZWQtdXVpZENzaWdYIPpU-vCe9rkpYs87YUrFNWkyNq8CVvmKwEjVinnDrJJc',
    tokenWithUUIDPatternPermissions:
      'qEF2AkF0GmEI03xDdHRsGDxDcmVzpURjaGFuoWljaGFubmVsLTEY70NncnChb2NoYW5uZWxfZ3JvdXAtMQVDdXNyoENzcGOgRHV1aWShZnV1aWQtMRhoQ3BhdKVEY2hhbqFtXmNoYW5uZWwtXFMqJBjvQ2dycKF0XjpjaGFubmVsX2dyb3VwLVxTKiQFQ3VzcqBDc3BjoER1dWlkoWpedXVpZC1cUyokGGhEbWV0YaBEdXVpZHR0ZXN0LWF1dGhvcml6ZWQtdXVpZENzaWdYIPpU-vCe9rkpYs87YUrFNWkyNq8CVvmKwEjVinnDrJJc',
  };

  constructor(options: any) {
    super(options);
  }

  stopPubnub() {
    state?.pubnub?.stop();
    state.pubnub = undefined;
  }

  getPubnub(config = undefined) {
    if (config) {
      // initialize instance of pubnub if config is passed
      // otherwise assume it is already initialied
      this.stopPubnub();
      state.pubnub = new (PubNub as any)(Object.assign({}, this.fixtures.defaultConfig, config)) as any;
    }

    return state.pubnub;
  }

  async checkContract() {
    return new Promise<boolean>((resolve) => {
      http.get(`http://${this.settings.contractServer}/expect`, (response) => {
        let data: any = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          let result;

          try {
            result = JSON.parse(data);
          } catch (e) {
            console.log('error fetching expect results', e);
            console.log(data);
          }
          resolve(result);
        });
      });
    });
  }

  /**
   * Disconnect pubnub subscribe loop
   *
   * TODO: fix JS SDK so that we can choose when to end the loop explicitly
   * or atleast get a promise to tell us when it is complete.
   */
  async cleanup(delayInMilliseconds: number) {
    if (!delayInMilliseconds) {
      this.getPubnub()?.unsubscribeAll();
    } else {
      return new Promise<void>((resolve) => {
        // allow a specified delay for subscribe loop before disconnecting
        setTimeout(() => {
          this.stopPubnub();
          resolve();
        }, delayInMilliseconds);
      });
    }
  }

  async delayCleanup() {
    return this.cleanup(300);
  }

  getFixture(name: string) {
    if (!this.fileFixtures[name]) {
      const persona = loadFixtureFile(name);
      this.fileFixtures[name] = persona;
    }
    return this.fileFixtures[name];
  }
  getFilePath(filename) {
    return getFilePath(filename);
  }
}

setWorldConstructor(PubnubWorld);
