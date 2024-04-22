import { Keyset } from './pubnub';

export class AccessManagerKeyset implements Keyset {
  subscribeKey = process.env.PAM_SUBSCRIBE_KEY || 'sub-key';
  secretKey = process.env.PAM_SECRET_KEY || 'secret-key';
  publishKey = process.env.PAM_PUBLISH_KEY || 'pub-key';
}

export class DemoKeyset implements Keyset {
  publishKey = 'demo';
  subscribeKey = 'demo';
}
