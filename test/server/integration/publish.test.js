/* global describe, it, before, after, beforeEach */

var assert = require('assert');
var PUBNUB = require('../../../node.js/pubnub.js');
var testUtils = require('../utils');

describe('#publish()', function () {
  this.timeout(180000);

  var messageString = 'Hi from Javascript';
  var messageJsono = { message: 'Hi from Javascript' };
  var messageJsonoQ = { message: 'How are you ?' };
  var messageJsona = ['message', 'Hi from javascript'];
  var messageNum = 123;
  var messageNumStr = '123';
  var messageJsonoStr = '{"message" : "Hi from Javascript"}';
  var messageJsonaStr = '["message" , "Hi from javascript"]';
  var fileFixtures = {};
  var itFixtures = {};

  before(function () {
    fileFixtures.channel = 'test_publish';
    fileFixtures.origin = 'blah.pubnub.com';
    fileFixtures.uuid = testUtils.getTestUUID();
    fileFixtures.message = 'hello';
    fileFixtures.publishKey = 'ds';
    fileFixtures.subscribeKey = 'ds';
  });

  beforeEach(function () {
    itFixtures.pubnub = PUBNUB.init({
      publish_key: fileFixtures.publishKey, // 'demo',
      subscribe_key: fileFixtures.subscribeKey, // 'demo',
      uuid: fileFixtures.uuid,
      origin: fileFixtures.origin,
      build_u: true
    });

    itFixtures.pubnub_enc = PUBNUB.init({
      publish_key: fileFixtures.publishKey, // 'demo',
      subscribe_key: fileFixtures.subscribeKey, // 'demo',
      uuid: fileFixtures.uuid,
      cipher_key: 'enigma',
      origin: fileFixtures.origin,
      build_u: true
    });
  });


  it('should publish strings without error', function (done) {
    var ch = fileFixtures.channel + '-' + '1';
    itFixtures.pubnub.subscribe({
      channel: ch,
      state: { name: 'dev' },
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch, message: messageString,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageString);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }
    });
  });


  it('should publish strings without error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '2';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch, message: messageString,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageString);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json objects without error', function (done) {
    var ch = fileFixtures.channel + '-' + '3';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch, message: messageJsono,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsono);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json objects without error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '4';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch,
          message: messageJsono,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsono);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json objects without error ( with ? in content ) ', function (done) {
    var ch = fileFixtures.channel + '-' + '5';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch, message: messageJsonoQ,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonoQ);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json objects without error when encryption is enabled ( with ? in content )', function (done) {
    var ch = fileFixtures.channel + '-' + '6';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch,
          message: messageJsonoQ,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonoQ);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json arrays without error', function (done) {
    var ch = fileFixtures.channel + '-' + '7';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch,
          message: messageJsona,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsona);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish json arrays without error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '8';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch,
          message: messageJsona,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsona);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish numbers without error', function (done) {
    var ch = fileFixtures.channel + '-' + '9';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch,
          message: messageNum,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageNum);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish numbers without error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '10';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch,
          message: messageNum,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageNum);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish number strings without error', function (done) {
    var ch = fileFixtures.channel + '-' + '11';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch,
          message: messageNumStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageNumStr);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish numbers strings error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '12';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch,
          message: messageNumStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageNumStr);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish json object strings without error', function (done) {
    var ch = fileFixtures.channel + '-' + '13';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch, message: messageJsonoStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonoStr);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should publish json object strings error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '14';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch, message: messageJsonoStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonoStr);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json array strings without error', function (done) {
    var ch = fileFixtures.channel + '-' + '15';
    itFixtures.pubnub.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub.publish({
          channel: ch, message: messageJsonaStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonaStr);
        itFixtures.pubnub.unsubscribe({ channel: ch });
        done();
      }
    });
  });

  it('should publish json array strings error when encryption is enabled', function (done) {
    var ch = fileFixtures.channel + '-' + '16';
    itFixtures.pubnub_enc.subscribe({
      channel: ch,
      connect: function () {
        itFixtures.pubnub_enc.publish({
          channel: ch, message: messageJsonaStr,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
          }
        });
      },
      callback: function (response) {
        assert.deepEqual(response, messageJsonaStr);
        itFixtures.pubnub_enc.unsubscribe({ channel: ch });
        done();
      }

    });
  });

  it('should store in history when store is not there or store is true', function (done) {
    var ch = fileFixtures.channel + '-' + '17';
    var messages = [1, 2, 3];

    itFixtures.pubnub.publish({
      channel: ch, message: messages[0],
      callback: function (response) {
        assert.deepEqual(response[0], 1);
        itFixtures.pubnub.publish({
          channel: ch, message: messages[1],
          callback: function (response) {
            assert.deepEqual(response[0], 1);
            itFixtures.pubnub.publish({
              channel: ch, message: messages[2],
              callback: function (response) {
                assert.deepEqual(response[0], 1);
                setTimeout(function () {
                  itFixtures.pubnub.history({
                    channel: ch,
                    callback: function (response) {
                      assert.deepEqual(messages, response[0]);
                      done();
                    },
                    count: 3
                  });
                }, 5000);
              }
            });
          }
        });
      }
    });
  });

  it('should not store in history when store is false', function (done) {
    var ch = fileFixtures.channel + '-' + '18';
    var messages = [4, 5, 6];

    itFixtures.pubnub.publish({
      channel: ch, message: messages[0], store_in_history: false,
      callback: function (response) {
        assert.deepEqual(response[0], 1);
        itFixtures.pubnub.publish({
          channel: ch, message: messages[1], store_in_history: false,
          callback: function (response) {
            assert.deepEqual(response[0], 1);
            itFixtures.pubnub.publish({
              channel: ch, message: messages[2], store_in_history: false,
              callback: function (response) {
                assert.deepEqual(response[0], 1);
                setTimeout(function () {
                  itFixtures.pubnub.history({
                    channel: ch,
                    callback: function (response) {
                      assert.notDeepEqual(messages, response[0]);
                      done();
                    },
                    count: 3
                  });
                }, 5000);
              }
            });
          }
        });
      }
    });
  });
});
