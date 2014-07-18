var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB.init({
    publish_key     : 'demo',
    subscribe_key     : 'demo',
    origin : 'pubsub-beta.pubnub.com'
});

var devpage = {
    "a": 1,
    "b": 2,
    "c": 3,
    "x": {
        "a": 1,
        "b": 2,
        "c": 3,
        "y": {
            "a": 1,
            "b": 2,
            "c": 3,
            "z": {
                "a": 1,
                "b": 2,
                "c": 3
            }
        }
    }
};
function get_object_id() {
    return 'devpage-' + Math.random();
}

describe('Pubnub', function() {

    this.timeout(180000);



    describe('#merge()', function(){

        it('should be able to merge an object with object id as parameter', function(done){
            var object_id = get_object_id();
            pubnub.merge({
                'object_id' : object_id,
                'data'      : devpage,
                'callback'  : function(r) {
                    pubnub.get({
                        'object_id' : object_id,
                        'callback'  : function(r) {
                            assert.deepEqual(r, devpage);
                            done();
                        },
                        'error'     : function(r) {
                            assert.ok(false);
                            done();
                        }
                    })
                    assert.ok(true);
                },
                'error'     : function(r) {
                    assert.ok(false);
                    done();
                }
            });

        })

        it('should be able to merge an object with object id and path as parameters', function(done){
            var object_id = get_object_id();
            pubnub.merge({
                'object_id' : object_id,
                'data'      : devpage,
                'path'      : 'x.a.b',
                'callback'  : function(r) {
                    pubnub.get({
                        'object_id' : object_id,
                        'path'      : 'x.a.b',
                        'callback'  : function(r) {
                            assert.deepEqual(r, devpage);
                            done();
                        },
                        'error'     : function(r) {
                            assert.ok(false);
                            done();
                        }
                    })
                    assert.ok(true);
                },
                'error'     : function(r) {
                    assert.ok(false);
                    done();
                }
            });

        })
    })
    describe('#set()', function(){

        it('should be able to set an object with object id as parameter', function(done){
            var object_id = get_object_id();
            pubnub.merge({
                'object_id' : object_id,
                'data'      : devpage,
                'callback'  : function(r) {
                    pubnub.get({
                        'object_id' : object_id,
                        'callback'  : function(r) {
                            assert.deepEqual(r, devpage);
                            done();
                        },
                        'error'     : function(r) {
                            assert.ok(false);
                            done();
                        }
                    })
                    assert.ok(true);
                },
                'error'     : function(r) {
                    assert.ok(false);
                    done();
                }
            });

        })

        it('should be able to set an object with object id and path as parameters', function(done){
            var object_id = get_object_id();
            pubnub.merge({
                'object_id' : object_id,
                'data'      : devpage,
                'path'      : 'x.a.b',
                'callback'  : function(r) {
                    pubnub.get({
                        'object_id' : object_id,
                        'path'      : 'x.a.b',
                        'callback'  : function(r) {
                            assert.deepEqual(r, devpage);
                            done();
                        },
                        'error'     : function(r) {
                            assert.ok(false);
                            done();
                        }
                    })
                    assert.ok(true);
                },
                'error'     : function(r) {
                    assert.ok(false);
                    done();
                }
            });

        })
    })

})