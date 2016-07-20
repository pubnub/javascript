

/*

audit(args: AuditArguments, callback: Function) {
  const { channel, channelGroup, authKeys = [] } = args;
  const endpointConfig: EndpointDefinition = {
    params: {
      subscribeKey: { required: true },
      publishKey: { required: true },
    },
    url: '/v1/auth/audit/sub-key/' + this._config.subscribeKey,
    operation: 'PNAccessManagerAudit'
  };

  // Make sure we have a Channel
  if (!callback) return this.log('Missing Callback');

  // validate this request and return false if stuff is missing
  if (!this.validateEndpointConfig(endpointConfig)) { return; }
  // create base params
  const params = this.createBaseParams(endpointConfig);

  params.timestamp = Math.floor(new Date().getTime() / 1000);

  if (channel) {
    params.channel = channel;
  }

  if (channelGroup) {
    params['channel-group'] = channelGroup;
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  let signInput = this._config.subscribeKey + '\n' + this._config.publishKey + '\naudit\n';
  signInput += utils.signPamFromParams(params);

  params.signature = this._crypto.HMACSHA256(signInput);

  this._networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
    if (status.error) return callback(status);
    callback(status, payload.payload);
  });
}
}

*/
