var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "dara25.devbuild.pubnub.com"

});

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;


function in_list(list,str) {
    for (var x in list) {
        if (list[x] === str) return true;
    }
    return false;
 }
  function in_list_deep(list,str) {
    for (var x in list) {
        if (JSON.stringify(list[x]) === JSON.stringify(str)) return true;
    }
    return false;
 }


describe('Pubnub', function() {

    this.timeout(40000);
    
    describe('#sync()', function(){
        
        describe('#on.ready()', function(){
            var seed = Date.now() + '-ready-';

            it('should get invoked when sync reference ready', function(done){
                var ref = pubnub.sync({'object_id' : seed + 'a.b'});
                ref.on.ready(function(r){
                    assert.ok(true,"Ready should be called");
                    ref.on.ready();
                    done();
                });
            })
            it('should get invoked on sync reference ready, when we are already listening to parent location', function(done){
                var ref1 = pubnub.sync({'object_id' : seed + 'a.b.c'});
                var ref2 = pubnub.sync({'object_id' : seed + 'a.b.c.d.e.f'});
                ref2.on.ready(function(r){
                    assert.ok(true,"Ready should be called");
                    ref2.on.ready();
                    done();
                });
            })
        })
        
        describe('#on.merge()', function(){
            
            
            it('should get invoked when merge happens', function(done){
                var seed = Date.now() + '-merge-1-';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});
                ref.on.merge(function(r){
                    assert.deepEqual(r.value(),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    ref.merge({
                        'data' : seed
                    });
                })

            })
            
            it('should get invoked when merge happens on child node', function(done){
                var seed = Date.now() + '-merge-2-';
                var ref = pubnub.sync({'object_id' : seed + 'a.b'});
                ref.on.merge(function(r){
                    assert.deepEqual(r.value('c.d'),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    pubnub.merge({
                        'object_id' : seed + 'a.b.c.d',
                        'data'      : seed,
                        'callback'  : function(r) {
                            assert.ok(true, 'Merge success')
                        },  
                        'error'     : function(r) {
                            assert.ok(false, 'Error occurred in merge');
                            done();
                        }
                    })
                })

            })
            it('should get invoked when merge happens on child node, when listening to root', function(done){
                var seed = Date.now() + '-merge-3';
                var ref = pubnub.sync({'object_id' : seed});
                ref.on.merge(function(r){
                    assert.deepEqual(r.value('a.b.c.d'),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    pubnub.merge({
                        'object_id' : seed + '.a.b.c.d',
                        'data'      : seed,
                        'callback'  : function(r) {
                            assert.ok(true, 'Merge success')
                        },  
                        'error'     : function(r) {
                            assert.ok(false, 'Error occurred in merge');
                            done();
                        }
                    })
                })

            })

        })
        
        describe('#on.replace()', function(){
            

            it('should get invoked when replace happens', function(done){
                var seed = Date.now() + '-replace-1-';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});
                ref.on.replace(function(r){
                    assert.deepEqual(r.value(),seed + 2);
                    assert.ok(true,"replace should be called");
                    ref.on.replace();
                    done();
                });
                ref.on.ready(function(r){
                    ref.replace({
                        'data' : seed + 2
                    });
                })

            })
            it('should get invoked when replace happens after remove', function(done){
                var seed = Date.now() + '-replace-2-';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});
                ref.on.replace(function(r){
                    assert.deepEqual(r.value(),seed + 3);
                    assert.ok(true,"replace should be called");
                    ref.on.replace();
                    done();
                });

                ref.on.merge(function(r){
                    assert.deepEqual(r.value(),seed + 2);
                    assert.ok(true,"merge should be called");
                    ref.remove();
                    ref.on.merge();
                });

                ref.on.remove(function(r){
                    assert.deepEqual(r.value(),{});
                    assert.ok(true,"remove should be called");
                    ref.replace({
                        'data' : seed + 3
                    });
                    ref.on.remove();
                });

                ref.on.ready(function(r){
                    ref.merge({
                        'data' : seed + 2
                    });
                })

            })
        })
        
        describe('#on.remove()', function(){
            var seed = Date.now() + '-remove-';

            it('should get invoked when remove happens', function(done){
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});
                ref.on.merge(function(r){
                    assert.deepEqual(r.value(), seed + 3);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    ref.on.remove(function(r){
                        assert.deepEqual(r.value(),{});
                        assert.ok(true,"Remove should be called");
                        ref.on.remove();
                        done();
                    });
                    ref.remove();
                });

                ref.on.ready(function(r){
                    ref.merge({
                        'data' : seed + 3
                    });
                })

            })
        })
        
        describe('#on.change()', function(){
            
            it('should get invoked when merge happens', function(done){
                var seed = Date.now() + '-change-1';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});

                ref.on.change(function(r){
                    assert.deepEqual(r.value(),seed + 1);
                    assert.ok(true,"Change should be called");
                    ref.on.change();
                    done();
                });
                ref.on.ready(function(r){
                    ref.merge({
                        'data' : seed + 1
                    });
                })
            })
            
            it('should get invoked when replace happens', function(done){
                var seed = Date.now() + '-change-2';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});

                ref.on.change(function(r){
                    assert.deepEqual(r.value(),seed + 2);
                    assert.ok(true,"Change should be called");
                    ref.on.change();
                    done();
                });
                ref.on.ready(function(r){
                    ref.replace({
                        'data' : seed + 2
                    });
                })

            })
            
            
            it('should get invoked when remove happens', function(done){
                var seed = Date.now() + '-change-3';
                var ref = pubnub.sync({'object_id' : seed + 'a.b.c.d'});

                ref.on.merge(function(r){
                    assert.deepEqual(r.value(), seed + 3);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    ref.on.change(function(r){
                        assert.deepEqual(r.value(),{});
                        assert.ok(true,"Change should be called");
                        ref.on.change();
                        done();
                    });
                    ref.remove();
                });

                ref.on.ready(function(r){
                    ref.merge({
                        'data' : seed + 3
                    })
                })
            })
            
        }) 
    })

})
