/* globals describe, beforeEach, PUBNUB, chai, it, before, _pubnub, variationRunner, _pubnub_subscribe */
/* eslint no-unused-vars: 0 */
/* eslint camelcase: 0 */

var assert = chai.assert;

describe('#grant, #revoke', function () {
  this.timeout(180000);

  var fileFixtures = {};
  var itFixtures = {};

  before(function () {
    fileFixtures.publishKey = 'ds-pam';
    fileFixtures.subscribeKey = 'ds-pam';
    fileFixtures.secretKey = 'ds-pam';
  });


  beforeEach(function () {
    itFixtures.channel = 'javascript-test-channel-' + Math.floor((Math.random() * 10) + 1);
  });

  describe('#grant() should be able to grant read write access', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_1 = grant_channel + '-1';
      var auth_key = 'abcd';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_1,
          auth_key: auth_key,
          read: true,
          write: true,
          ttl: 100,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_1,
              auth_key: auth_key,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                assert.ok(response.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
                pubnub_pam.history({
                  channel: grant_channel_1,
                  auth_key: auth_key,
                  callback: function () {
                    assert.ok(true, 'Success Callback');
                    pubnub_pam.publish({
                      channel: grant_channel_1,
                      auth_key: auth_key,
                      message: 'Node Test',
                      callback: function () {
                        assert.ok(true, 'Success callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(false, 'Error should not occur if permission granted');
                    pubnub_pam.publish({
                      channel: grant_channel_1,
                      message: 'Node Test',
                      auth_key: auth_key,
                      callback: function () {
                        assert.ok(true, 'Success Callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#grant() should be able to grant read write access without auth key', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_8 = grant_channel + '-8';
      var sub_key = 'ds-pam';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_8,
          read: true,
          write: true,
          ttl: 100,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_8,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.channels[grant_channel_8].r === 1, 'Grant Audit Read should be 1');
                assert.ok(response.channels[grant_channel_8].w === 1, 'Grant Audit Write shoudld be 1');
                assert.ok(response.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
                pubnub_pam.history({
                  channel: grant_channel_8,
                  auth_key: '',
                  callback: function () {
                    assert.ok(true, 'Success Callback');
                    pubnub_pam.publish({
                      channel: grant_channel_8,
                      auth_key: '',
                      message: 'Node Test',
                      callback: function () {
                        assert.ok(true, 'Success callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(false, 'Error should not occur if permission granted');
                    pubnub_pam.publish({
                      channel: grant_channel_8,
                      message: 'Node Test',
                      auth_key: '',
                      callback: function () {
                        assert.ok(true, 'Success Callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#grant() should be able to grant read, revoke write access', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_2 = grant_channel + '-2';
      var auth_key = 'abcd';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_2,
          auth_key: auth_key,
          read: true,
          write: false,
          ttl: 5,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_2,
              auth_key: auth_key,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.auths.abcd.r === 1, 'Grant Audit Read should be 1');
                assert.ok(response.auths.abcd.w === 0, 'Grant Audit Write should be 0');
                pubnub_pam.history({
                  channel: grant_channel_2,
                  auth_key: auth_key,
                  callback: function () {
                    assert.ok(true, 'Success Callback');
                    pubnub_pam.publish({
                      channel: grant_channel_2,
                      auth_key: auth_key,
                      message: 'Test',
                      callback: function () {
                        assert.ok(false, 'Success callback should not be invoked when permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(true, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(false, 'Error should not occur if permission granted');
                    pubnub_pam.publish({
                      channel: grant_channel_2,
                      message: 'Test',
                      auth_key: auth_key,
                      callback: function () {
                        assert.ok(false, 'Success callback should not be invoked when permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(true, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#grant() should be able to revoke read, grant write access', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_3 = grant_channel + '-3';
      var auth_key = 'abcd';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_3,
          auth_key: auth_key,
          read: false,
          write: true,
          ttl: 100,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_3,
              auth_key: auth_key,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                assert.ok(response.auths.abcd.w === 1, 'Grant Audit Write shoudld be 1');
                pubnub_pam.history({
                  channel: grant_channel_3,
                  auth_key: auth_key,
                  callback: function () {
                    assert.ok(false, 'Success Callback should not be invoked when permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_3,
                      auth_key: auth_key,
                      message: 'Node Test',
                      callback: function () {
                        assert.ok(true, 'Success callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(true, 'Error should occur if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_3,
                      message: 'Node Test',
                      auth_key: auth_key,
                      callback: function () {
                        assert.ok(true, 'Success Callback');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should not occur if permission granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#grant() should be able to revoke read write access', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_4 = grant_channel + '-4';
      var auth_key = 'abcd';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_4,
          auth_key: auth_key,
          read: false,
          write: false,
          ttl: 100,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_4,
              auth_key: auth_key,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                assert.ok(response.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
                pubnub_pam.history({
                  channel: grant_channel_4,
                  auth_key: auth_key,
                  callback: function () {
                    assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_4,
                      auth_key: auth_key,
                      message: 'Test',
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(true, 'Error should occur if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_4,
                      message: 'Test',
                      auth_key: auth_key,
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(true, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#grant() should be able to revoke read write access without auth key', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_7 = grant_channel + '-7';
      var sub_key = 'ds-pam';

      setTimeout(function () {
        pubnub_pam.grant({
          channel: grant_channel_7,
          read: false,
          write: false,
          ttl: 100,
          callback: function () {
            // ok(response.status === 200, 'Grant Response');
            pubnub_pam.audit({
              channel: grant_channel_7,
              callback: function (response) {
                // ok(response.status === 200, 'Grant Audit Response');
                assert.ok(response.channels[grant_channel_7].r === 0, 'Grant Audit Read should be 0');
                assert.ok(response.channels[grant_channel_7].w === 0, 'Grant Audit Write shoudld be 0');
                assert.ok(response.subscribe_key === sub_key, 'Grant Audit Response Sub Key should match');
                pubnub_pam.history({
                  channel: grant_channel_7,
                  auth_key: '',
                  callback: function () {
                    assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_7,
                      auth_key: '',
                      message: 'Test',
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(true, 'Error should occur if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_7,
                      message: 'Test',
                      auth_key: '',
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(true, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });

  describe('#revoke() should be able to revoke access', function () {
    var testFun = function (done, config) {
      var pubnub_pam = _pubnub({
        publish_key: fileFixtures.publishKey,
        subscribe_key: fileFixtures.subscribeKey,
        secret_key: fileFixtures.secretKey,
        build_u: true
      }, config);

      var grant_channel = fileFixtures.channel + '-grant';
      var grant_channel_5 = grant_channel + '-5';
      var auth_key = 'abcd';

      setTimeout(function () {
        pubnub_pam.revoke({
          channel: grant_channel_5,
          auth_key: auth_key,
          callback: function () {
            pubnub_pam.audit({
              channel: grant_channel_5,
              auth_key: auth_key,
              callback: function (response) {
                assert.ok(response.auths.abcd.r === 0, 'Grant Audit Read should be 0');
                assert.ok(response.auths.abcd.w === 0, 'Grant Audit Write shoudld be 0');
                pubnub_pam.history({
                  channel: grant_channel_5,
                  auth_key: auth_key,
                  callback: function () {
                    assert.okok(false, 'Success Callback should not be invoked if permission not granted ');
                    pubnub_pam.publish({
                      channel: grant_channel_5,
                      auth_key: auth_key,
                      message: 'Test',
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(false, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  },
                  error: function () {
                    assert.ok(true, 'Error should occur if permission not granted');
                    pubnub_pam.publish({
                      channel: grant_channel_5,
                      message: 'Test',
                      auth_key: auth_key,
                      callback: function () {
                        assert.ok(false, 'Success Callback should not be invoked if permission not granted');
                        done();
                      },
                      error: function () {
                        assert.ok(true, 'Error should occur if permission not granted');
                        done();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }, 5000);
    };

    variationRunner(testFun);
  });
});
