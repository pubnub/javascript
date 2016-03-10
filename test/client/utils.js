/* global it, assert, PUBNUB, _ */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var in_list = function (list, str) {
  for (var x in list) {
    if (list[x] === str) return true;
  }
  return false;
};

var in_list_deep = function (list, obj) {
  for (var x in list) {
    if (_.isEqual(list[x], obj)) return true;
  }
  return false;
};

var variationRunner = function (testFun) {
  it('over http', function (done) {
    testFun(done, {});
  });

  it('over https', function (done) {
    testFun(done, { ssl: true });
  });

  it('over http w/ presence', function (done) {
    testFun(done, {
      presence: function (r) {
        if (!r.action) { assert.ok(false, 'presence called'); }
      }
    });
  });

  it('over https w/ presence', function (done) {
    testFun(done, {
      ssl: true,
      presence: function (r) {
        if (!r.action) { assert.ok(false, 'presence called'); }
      }
    });
  });
};

var get_random = function () {
  return Math.floor((Math.random() * 100000000000) + 1);
};

var _pubnub_subscribe = function (pubnub, args, config) {
  if (config && config.presence) args.presence = config.presence;
  return pubnub.subscribe(args);
};

var _pubnub_init = function (args, config, pn) {
  if (config) {
    args.ssl = config.ssl;
    args.jsonp = config.jsonp;
    // args.cipher_key = config.cipher_key;
  }
  if (pn) {
    return pn(args);
  } else {
    return PUBNUB(args);
  }
};

var _pubnub = function (args, config, pn) {
  if (config) {
    args.ssl = config.ssl;
    args.jsonp = config.jsonp;
    // args.cipher_key = config.cipher_key;
  }
  if (pn) {
    return pn(args);
  } else {
    return PUBNUB(args);
  }
};
