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
  var message_string_numeric = '12345';
  var message_string_array = '[0,1,2,3]';
  var message_string_object = '{"foo":"bar"}';

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

  describe('should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard, for ex. reveive on a.foo when subscribed to a.*', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      var message = '😀';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: message,
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
          assert.deepEqual(response, message, 'message received 2');
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

  describe('should receive emoji (unicode) message when subscribed to wildcard, if message is published on a channel which matches wildcard when ENCRYPTION is enabled, for ex. reveive on a.foo when subscribed to a.*', function () {
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

      var message = '😀';

      _pubnub_subscribe(pubnub, {
        channel: chw,
        connect: function () {
          setTimeout(function () {
            pubnub.publish({
              channel: chwc,
              message: message,
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
          assert.deepEqual(response, message, 'message received 2');
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

  describe('should be able to handle wildcard, channel group and channel together', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub_init({
        publish_key: 'pub-c-8beb3658-0dfd-4032-8f4b-9c6b9ca4d803',
        subscribe_key: 'sub-c-82ab2196-b64f-11e5-8622-0619f8945a4f',
        cipher_key: 'enigma'
      }, config);

      var random = get_random();
      var ch = 'channel-' + random;
      var chg = 'channel-group-' + random;
      var chgc = 'channel-group-channel' + random;
      var chw = ch + '.*';
      var chwc = ch + '.a';

      pubnub.channel_group_add_channel({
        channel_group: chg,
        channels: chgc,
        callback: function () {
          pubnub.channel_group_list_channels({
            channel_group: chg,
            callback: function () {
              _pubnub_subscribe(pubnub, {
                channel: ch,
                connect: function () {
                  _pubnub_subscribe(pubnub, {
                    channel: chw,
                    connect: function () {
                      _pubnub_subscribe(pubnub, {
                        channel_group: chg,
                        connect: function () {
                          setTimeout(function () {
                            pubnub.publish({
                              channel: ch,
                              message: 'message' + ch,
                              callback: function () {
                                assert.ok(true, 'message published');
                                pubnub.publish({
                                  channel: chwc,
                                  message: 'message' + chwc,
                                  callback: function () {
                                    assert.ok(true, 'message published');
                                    pubnub.publish({
                                      channel: chgc,
                                      message: 'message' + chgc,
                                      callback: function () {
                                        assert.ok(true, 'message published');
                                      },
                                      error: function () {
                                        assert.ok(false, 'error occurred in publish');
                                        done();
                                      }
                                    });
                                  },
                                  error: function () {
                                    assert.ok(false, 'error occurred in publish');
                                    done();
                                  }
                                });
                              },
                              error: function () {
                                assert.ok(false, 'error occurred in publish');
                                done();
                              }
                            });
                          }, 5000);
                        },
                        callback: function (response) {
                          assert.deepEqual(response, 'message' + chgc, 'message received 1');
                          // pubnub.unsubscribe({ channel_group: chg });
                        },
                        error: function () {
                          assert.ok(false);
                          done();
                          // pubnub.unsubscribe({ channel: chgc });
                        }
                      });
                    },
                    callback: function (response) {
                      assert.deepEqual(response, 'message' + chwc, 'message received 2');
                      // pubnub.unsubscribe({ channel: chw });
                    },
                    error: function () {
                      assert.ok(false);
                      done();
                      // pubnub.unsubscribe({ channel: chw });
                    }
                  });
                },
                callback: function (response) {
                  assert.deepEqual(response, 'message' + ch, 'message received 3');
                  // pubnub.unsubscribe({ channel: ch });
                  done();
                },
                error: function () {
                  assert.ok(false);
                  // pubnub.unsubscribe({ channel: ch });
                }
              });
            },
            error: function () {
              assert.ok(false, 'error occurred');
            }
          });
        },
        error: function () {
          assert.ok(false, 'error occurred in adding channel to group');
        }

      });
    };

    variationRunner(testFun);
  });

  describe('should take heartbeat as argument', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        heartbeat: 30,
        connect: function () {
          assert.ok(true, 'connect should be called');
          pubnub.unsubscribe({ channel: ch });
          done();
        },
        callback: function (response) {

        },
        error: function () {
          assert.ok(false, 'error should not occur');
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should pass on plain text on decryption error', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: messageString,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, messageString);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        },
        error: function () {
          assert.ok(false, 'error should not occur');
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not a number)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_string_numeric,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_numeric);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not a number) ( encryption enabled )', function () {
    var testFun = function (done, config) {
      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub_enc, { channel: ch,
        connect: function () {
          pubnub_enc.publish({ channel: ch, message: message_string_numeric,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_numeric);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not an array)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_string_array,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_array);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not an array) ( encryption enabled )', function () {
    var testFun = function (done, config) {
      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub_enc, { channel: ch,
        connect: function () {
          pubnub_enc.publish({ channel: ch, message: message_string_array,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_array);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not an object)', function () {
    var testFun = function (done, config) {
      var pubnub = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub, { channel: ch,
        connect: function () {
          pubnub.publish({ channel: ch, message: message_string_object,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_object);
          pubnub.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });

  describe('should receive a string (not an object) ( encryption enabled )', function () {
    var testFun = function (done, config) {
      var pubnub_enc = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        cipher_key: 'enigma'
      }, config);

      var ch = itFixtures.channel + '-' + get_random();
      _pubnub_subscribe(pubnub_enc, { channel: ch,
        connect: function () {
          pubnub_enc.publish({ channel: ch, message: message_string_object,
            callback: function (response) {
              assert.equal(response[0], 1);
            }
          });
        },
        callback: function (response) {
          assert.deepEqual(response, message_string_object);
          pubnub_enc.unsubscribe({ channel: ch });
          done();
        }
      }, config);
    };

    variationRunner(testFun);
  });
});
