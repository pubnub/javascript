/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, get_random, _pubnub_subscribe */
/* globals _pubnub_init */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#subscribe', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};
  var messageString = 'Hi from Javascript';
  var message_jsono = { message: 'Hi Hi from Javascript' };
  var message_jsona = ['message', 'Hi Hi from javascript'];
  var message_number = 123456;

  before(function () {
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('should receive message when subscribed to wildcard, if message is published on a channel which matches wildcard, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: 'message' + chwc,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, 'message' + chwc, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });

  describe('should receive message when subscribed to wildcard, if message is published on a channel which matches wildcard when ENCRYPTION is enabled, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: 'message' + chwc,
              callback: function () {
                assert.ok(true, 'message published');
              },
              error: function () {
                assert.ok(false, 'error occurred in publish');
              }
            });
          }, 5000);
        },
        callback: function (response) {
          assert.deepEqual(response, 'message' + chwc, 'message received 2');
          pubnub.unsubscribe({ channel: chwc });
          done();
        },
        error: function () {
          assert.ok(false);
          pubnub.unsubscribe({ channel: chwc });
        }
      });
    };

    variationRunner(testFun);
  });
});

/*

pubnub_test_all("subscribe() should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard, for ex. reveive on a.foo when subscribed to a.*",function(config){
  var random  = get_random();
  var ch      = 'channel-' + random;
  var chw     = ch + '.*';
  var chwc    = ch + ".a";

  var pubnub = _pubnub_init({
    publish_key: test_publish_key,
    subscribe_key: test_subscribe_key
  }, config);

  expect(2);
  stop(2);

  var message = '😀';

  _pubnub_subscribe(pubnub, {
    channel: chw,
    connect: function () {
      setTimeout(function(){
        pubnub.publish({
          'channel' : chwc,
          message : message,
          callback : function(r) {
            ok(true, 'message published');
            start();
          },
          error : function(r) {
            ok(false, 'error occurred in publish');
          }
        })
      }, 5000);
    },
    callback: function (response) {
      deepEqual(response, message, "message received 2");
      //pubnub.unsubscribe({channel: chwc});
      start();
    },
    error: function () {
      ok(false);
      pubnub.unsubscribe({channel: chwc});

    }
  });

})

pubnub_test_all("subscribe() should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard when ENCRYPTION is enabled, for ex. reveive on a.foo when subscribed to a.*",function(config){
  var random  = get_random();
  var ch      = 'channel-' + random;
  var chw     = ch + '.*';
  var chwc    = ch + ".a";

  var pubnub = _pubnub_init({
    publish_key: test_publish_key,
    subscribe_key: test_subscribe_key,
    cipher_key: 'enigma'
  }, config);

  var message = '😀';
  expect(2);
  stop(2);
  _pubnub_subscribe(pubnub, {
    channel: chw,
    connect: function () {
      setTimeout(function(){
        pubnub.publish({
          'channel' : chwc,
          message : message,
          callback : function(r) {
            ok(true, 'message published');
            start();
          },
          error : function(r) {
            ok(false, 'error occurred in publish');
          }
        })
      }, 5000);
    },
    callback: function (response) {
      deepEqual(response, message, "message received 2");
      //pubnub.unsubscribe({channel: chwc});
      start();
    },
    error: function () {
      ok(false);
      pubnub.unsubscribe({channel: chwc});

    }
  });

})

pubnub_test_all("subscribe() should be able to handle wildcard, channel group and channel together",function(config){
  var random  = get_random();
  var ch      = 'channel-' + random;
  var chg     = 'channel-group-' + random;
  var chgc    = 'channel-group-channel' + random
  var chw     = ch + '.*';
  var chwc    = ch + ".a";

  var pubnub = _pubnub_init({
    publish_key: test_publish_key,
    subscribe_key: test_subscribe_key
  }, config);

  expect(6);
  stop(4);

  pubnub.channel_group_add_channel({
    'channel_group' : chg,
    'channels'      : chgc,
    'callback'      : function(r) {
      pubnub.channel_group_list_channels({
        'channel_group' : chg,
        'callback' : function(r) {
          _pubnub_subscribe(pubnub, {
            channel: ch,
            connect: function () {
              _pubnub_subscribe(pubnub, {
                channel: chw,
                connect: function () {
                  _pubnub_subscribe(pubnub, {
                    channel_group: chg,
                    connect: function () {
                      setTimeout(function(){
                        pubnub.publish({
                          'channel' : ch,
                          message : 'message' + ch,
                          callback : function(r) {
                            ok(true, 'message published');
                            pubnub.publish({
                              'channel' : chwc,
                              message : 'message' + chwc,
                              callback : function(r) {
                                ok(true, 'message published');
                                pubnub.publish({
                                  'channel' : chgc,
                                  message : 'message' + chgc,
                                  callback : function(r) {
                                    ok(true, 'message published');
                                    start();
                                  },
                                  error : function(r) {
                                    ok(false, 'error occurred in publish');
                                  }

                                })
                              },
                              error : function(r) {
                                ok(false, 'error occurred in publish');
                              }
                            })
                          },
                          error : function(r) {
                            ok(false, 'error occurred in publish');
                          }

                        })
                      }, 5000);
                    },
                    callback: function (response) {
                      deepEqual(response, 'message' + chgc, "message received 1");
                      //pubnub.unsubscribe({channel: chgc});
                      start();
                    },
                    error: function () {
                      ok(false);
                      pubnub.unsubscribe({channel: chgc});
                      start();
                    }
                  });
                },
                callback: function (response) {
                  deepEqual(response, 'message' + chwc, "message received 2");
                  //pubnub.unsubscribe({channel: chwc});
                  start();
                },
                error: function () {
                  ok(false);
                  pubnub.unsubscribe({channel: chwc});

                }
              });
            },
            callback: function (response) {
              deepEqual(response, 'message' + ch, "message received 3");
              //pubnub.unsubscribe({channel: ch});
              start();
            },
            error: function () {
              ok(false);
              pubnub.unsubscribe({channel: ch});
            }
          })
        },
        'error' : function(r) {
          ok(false, "error occurred");
        }
      })
    },
    'error'         : function(r) {
      ok(false, "error occurred in adding channel to group");
    }

  });

})
*/