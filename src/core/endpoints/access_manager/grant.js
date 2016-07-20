
/*

grant(args: GrantArguments, callback: Function) {
  const { channels = [], channelGroups = [], ttl, read = false, write = false, manage = false, authKeys = [] } = args;
  const endpointConfig: EndpointDefinition = {
    params: {
      subscribeKey: { required: true },
      publishKey: { required: true },
    },
    url: '/v1/auth/grant/sub-key/' + this._config.subscribeKey,
    operation: 'PNAccessManagerGrant'
  };

  if (!callback) return this.log('Missing Callback');

  // validate this request and return false if stuff is missing
  if (!this.validateEndpointConfig(endpointConfig)) { return; }
  // create base params
  const params = this.createBaseParams(endpointConfig);

  params.r = (read) ? '1' : '0';
  params.w = (write) ? '1' : '0';
  params.m = (manage) ? '1' : '0';
  params.timestamp = Math.floor(new Date().getTime() / 1000);

  if (channels.length > 0) {
    params.channel = channels.join(',');
  }

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  let signInput = this._config.subscribeKey + '\n' + this._config.publishKey + '\ngrant\n';
  signInput += utils.signPamFromParams(params);

  params.signature = this._crypto.HMACSHA256(signInput);

  this._networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
    if (status.error) return callback(status);
    callback(status, payload.payload);
  });
}

*/
