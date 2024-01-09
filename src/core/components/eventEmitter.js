export default class EventEmitter {
  modules;
  listenerManager;
  getFileUrl;

  _decoder;
  constructor({ modules, listenerManager, getFileUrl }) {
    this.modules = modules;
    this.listenerManager = listenerManager;
    this.getFileUrl = getFileUrl;
    if (modules.cryptoModule) this._decoder = new TextDecoder();
  }
  emitEvent(e) {
    const { channel, publishMetaData } = e;
    let { subscriptionMatch } = e;
    if (channel === subscriptionMatch) {
      subscriptionMatch = null;
    }

    if (e.channel.endsWith('-pnpres')) {
      const announce = {};
      announce.channel = null;
      announce.subscription = null;

      if (channel) {
        announce.channel = channel.substring(0, channel.lastIndexOf('-pnpres'));
      }

      if (subscriptionMatch) {
        announce.subscription = subscriptionMatch.substring(0, subscriptionMatch.lastIndexOf('-pnpres'));
      }

      announce.action = e.payload.action;
      announce.state = e.payload.data;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.occupancy = e.payload.occupancy;
      announce.uuid = e.payload.uuid;
      announce.timestamp = e.payload.timestamp;

      if (e.payload.join) {
        announce.join = e.payload.join;
      }

      if (e.payload.leave) {
        announce.leave = e.payload.leave;
      }

      if (e.payload.timeout) {
        announce.timeout = e.payload.timeout;
      }

      this.listenerManager.announcePresence(announce);
    } else if (e.messageType === 1) {
      const announce = {};
      announce.channel = null;
      announce.subscription = null;

      announce.channel = channel;
      announce.subscription = subscriptionMatch;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.publisher = e.issuingClientId;
      if (e.userMetadata) {
        announce.userMetadata = e.userMetadata;
      }

      announce.message = e.payload;

      this.listenerManager.announceSignal(announce);
    } else if (e.messageType === 2) {
      const announce = {};
      announce.channel = null;
      announce.subscription = null;
      announce.channel = channel;
      announce.subscription = subscriptionMatch;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.publisher = e.issuingClientId;
      if (e.userMetadata) {
        announce.userMetadata = e.userMetadata;
      }
      announce.message = {
        event: e.payload.event,
        type: e.payload.type,
        data: e.payload.data,
      };
      this.listenerManager.announceObjects(announce);
      if (e.payload.type === 'uuid') {
        const eventData = this._renameChannelField(announce);
        this.listenerManager.announceUser({
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            type: 'user',
          },
        });
      } else if (message.payload.type === 'channel') {
        const eventData = this._renameChannelField(announce);
        this.listenerManager.announceSpace({
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            type: 'space',
          },
        });
      } else if (message.payload.type === 'membership') {
        const eventData = this._renameChannelField(announce);
        const { uuid: user, channel: space, ...membershipData } = eventData.message.data;
        membershipData.user = user;
        membershipData.space = space;
        this.listenerManager.announceMembership({
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            data: membershipData,
          },
        });
      }
    } else if (e.messageType === 3) {
      const announce = {};
      announce.channel = channel;
      announce.subscription = subscriptionMatch;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.publisher = e.issuingClientId;
      announce.data = {
        messageTimetoken: e.payload.data.messageTimetoken,
        actionTimetoken: e.payload.data.actionTimetoken,
        type: e.payload.data.type,
        uuid: e.issuingClientId,
        value: e.payload.data.value,
      };
      announce.event = e.payload.event;
      this.listenerManager.announceMessageAction(announce);
    } else if (e.messageType === 4) {
      const announce = {};
      announce.channel = channel;
      announce.subscription = subscriptionMatch;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.publisher = e.issuingClientId;

      let msgPayload = e.payload;

      if (this.modules.cryptoModule) {
        let decryptedPayload;
        try {
          const decryptedData = this.modules.cryptoModule.decrypt(e.payload);
          decryptedPayload =
            decryptedData instanceof ArrayBuffer ? JSON.parse(this._decoder.decode(decryptedData)) : decryptedData;
        } catch (e) {
          decryptedPayload = null;
          announce.error = `Error while decrypting message content: ${e.message}`;
        }
        if (decryptedPayload !== null) {
          msgPayload = decryptedPayload;
        }
      }

      if (e.userMetadata) {
        announce.userMetadata = e.userMetadata;
      }

      announce.message = msgPayload.message;

      announce.file = {
        id: msgPayload.file.id,
        name: msgPayload.file.name,
        url: this.getFileUrl({
          id: msgPayload.file.id,
          name: msgPayload.file.name,
          channel,
        }),
      };

      this.listenerManager.announceFile(announce);
    } else {
      const announce = {};
      announce.channel = null;
      announce.subscription = null;

      announce.channel = channel;
      announce.subscription = subscriptionMatch;
      announce.timetoken = publishMetaData.publishTimetoken;
      announce.publisher = e.issuingClientId;

      if (e.userMetadata) {
        announce.userMetadata = e.userMetadata;
      }

      if (this.modules.cryptoModule) {
        let decryptedPayload;
        try {
          const decryptedData = this.modules.cryptoModule.decrypt(e.payload);
          decryptedPayload =
            decryptedData instanceof ArrayBuffer ? JSON.parse(this._decoder.decode(decryptedData)) : decryptedData;
        } catch (e) {
          decryptedPayload = null;
          announce.error = `Error while decrypting message content: ${e.message}`;
        }
        if (decryptedPayload != null) {
          announce.message = decryptedPayload;
        } else {
          announce.message = e.payload;
        }
      } else {
        announce.message = e.payload;
      }

      this.listenerManager.announceMessage(announce);
    }
  }

  _renameEvent(e) {
    return e === 'set' ? 'updated' : 'removed';
  }

  _renameChannelField(announce) {
    const { channel, ...eventData } = announce;
    eventData.spaceId = channel;
    return eventData;
  }
}
