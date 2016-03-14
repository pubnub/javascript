/* @flow */

import Networking from '../components/networking';
import PublishQueue from '../components/publish_queue';
import Responders from '../presenters/responders';

type pushConstruct = {
  networking: Networking,
  publishQueue: PublishQueue
};

type provisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type modifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns',
  device: string,
  channel: string
};

type sendNotificationArguments = {
  apns: ?Object, // apple push notification service
  gcm: ?Object, // google cloud messaging
  mpns: ?Object, // microsoft push notification
  channel: string, // push notification destination.
}

export default class {
  _networking: Networking;
  _publishQueue: PublishQueue;
  _r: Responders;

  constructor({ networking, publishQueue }: pushConstruct) {
    this._networking = networking;
    this._publishQueue = publishQueue;
    this._r = new Responders('endpoints/push');
  }

  addDeviceToPushChannel(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channel } = args;
    const payload = { operation: 'add', pushGateway, device, channel };
    this.__provisionDevice(payload, callback);
  }

  removeDeviceFromPushChannel(args: modifyDeviceArgs, callback: Function) {
    let { pushGateway, device, channel } = args;
    const payload = { operation: 'remove', pushGateway, device, channel };
    this.__provisionDevice(payload, callback);
  }

  send({ apns, gcm, mpns, channel }: sendNotificationArguments, callback: Function) {
    let payload: Object = {};
    let publishItem = this._publishQueue.newQueueable();

    if (!channel) {
      return callback(this._r.validationError('Missing Push Channel (channel)'));
    }

    if (!apns && !gcm && !mpns) {
      return callback(this._r.validationError('Missing Push Payload (apns, gcm, mpns)'));
    }

    if (apns) {
      payload.pn_apns = apns;
    }

    if (gcm) {
      payload.pn_gcm = gcm;
    }

    if (mpns) {
      payload.pn_mpns = mpns;
    }

    publishItem.payload = payload;
    publishItem.channel = channel;
    publishItem.params = {};
    publishItem.httpMethod = 'GET';
    publishItem.callback = callback;

    this._publishQueue.queueItem(publishItem);
  }

  __provisionDevice(args: provisionDeviceArgs, callback: Function) {
    let { operation, pushGateway, device, channel } = args;

    if (!device) {
      return callback(this._r.validationError('Missing Device ID (device)'));
    }

    if (!pushGateway) {
      return callback(this._r.validationError('Missing GW Type (pushGateway: gcm or apns)'));
    }

    if (!operation) {
      return callback(this._r.validationError('Missing GW Operation (operation: add or remove)'));
    }

    if (!channel) {
      return callback(this._r.validationError('Missing gw destination Channel (channel)'));
    }

    let data: Object = {
      type: pushGateway
    };

    if (operation === 'add') {
      data.add = channel;
    } else if (operation === 'remove') {
      data.remove = channel;
    }

    this._networking.provisionDeviceForPush(device, data, callback);
  }

}
