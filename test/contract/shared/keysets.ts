export class AccessManagerKeyset {
  publishKey = process.env.PUBLISH_KEY_ACCESS || 'pub-key';
  subscribeKey = process.env.SUBSCRIBE_KEY_ACCESS || 'sub-key';
  secretKey = process.env.SECRET_KEY_ACCESS || 'secret-key';
}
