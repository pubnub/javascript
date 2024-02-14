export default class EventEmitter {
  modules;
  listenerManager;
  getFileUrl;

  _channelListenerMap;
  _groupListenerMap;
  _decoder;
  constructor({ modules, listenerManager, getFileUrl }) {
    this.modules = modules;
    this.listenerManager = listenerManager;
    this.getFileUrl = getFileUrl;
    this._channelListenerMap = new Map();
    this._groupListenerMap = new Map();
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
      // deprecated -->
      announce.actualChannel = subscriptionMatch != null ? channel : null;
      announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
      // <-- deprecated

      this.listenerManager.announcePresence(announce);
      this._announce('presence', announce, announce.channel, announce.subscription);
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
      this._announce('signal', announce, announce.channel, announce.subscription);
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
      this._announce('objects', announce, announce.channel, announce.subscription);
      if (e.payload.type === 'uuid') {
        const eventData = this._renameChannelField(announce);
        const userEvent = {
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            type: 'user',
          },
        };
        this.listenerManager.announceUser(userEvent);
        this._announce('user', userEvent, announce.channel, announce.subscription);
      } else if (message.payload.type === 'channel') {
        const eventData = this._renameChannelField(announce);
        const spaceEvent = {
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            type: 'space',
          },
        };
        this.listenerManager.announceSpace(spaceEvent);
        this._announce('space', spaceEvent, announce.channel, announce.subscription);
      } else if (message.payload.type === 'membership') {
        const eventData = this._renameChannelField(announce);
        const { uuid: user, channel: space, ...membershipData } = eventData.message.data;
        membershipData.user = user;
        membershipData.space = space;
        const membershipEvent = {
          ...eventData,
          message: {
            ...eventData.message,
            event: this._renameEvent(eventData.message.event),
            data: membershipData,
          },
        };
        this.listenerManager.announceMembership(membershipEvent);
        this._announce('membership', membershipEvent, announce.channel, announce.subscription);
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
      this._announce('messageAction', announce, announce.channel, announce.subscription);
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
      this._announce('file', announce, announce.channel, announce.subscription);
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
      // deprecated -->
      announce.actualChannel = subscriptionMatch != null ? channel : null;
      announce.subscribedChannel = subscriptionMatch != null ? subscriptionMatch : channel;
      // <-- deprecated

      this.listenerManager.announceMessage(announce);
      this._announce('message', announce, announce.channel, announce.subscription);
    }
  }

  addListener(l, channels, groups) {
    if (!(channels && groups)) {
      this.listenerManager.addListener(l);
    } else {
      channels?.forEach((c) => {
        if (this._channelListenerMap[c]) {
          if (!this._channelListenerMap[c].includes(l)) this._channelListenerMap[c].push(l);
        } else {
          this._channelListenerMap[c] = [l];
        }
      });
      groups?.forEach((g) => {
        if (this._groupListenerMap[g]) {
          if (!this._groupListenerMap[g].includes(l)) this._groupListenerMap[g].push(l);
        } else {
          this._groupListenerMap[g] = [l];
        }
      });
    }
  }

  removeListener(listener, channels, groups) {
    if (!(channels && groups)) {
      this.listenerManager.removeListener(l);
    } else {
      channels?.forEach((c) => {
        this._channelListenerMap[c] = this._channelListenerMap[c]?.filter((l) => l !== listener);
      });
      groups?.forEach((g) => {
        this._groupListenerMap[g] = this._groupListenerMap[g]?.filter((l) => l !== listener);
      });
    }
  }

  removeAllListeners() {
    this.listenerManager.removeAllListeners();
  }

  _renameEvent(e) {
    return e === 'set' ? 'updated' : 'removed';
  }

  _renameChannelField(announce) {
    const { channel, ...eventData } = announce;
    eventData.spaceId = channel;
    return eventData;
  }

  _announce(type, event, channel, group) {
    this._channelListenerMap[channel]?.forEach((l) => l[type] && l[type](event));
    this._groupListenerMap[group]?.forEach((l) => l[type] && l[type](event));
  }
}
