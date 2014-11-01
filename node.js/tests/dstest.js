var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin: "dara24.devbuild.pubnub.com"

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
                var ref = pubnub.sync(seed + 'a.b');
                ref.on.ready(function(r){
                    assert.ok(true,"Ready should be called");
                    ref.on.ready();
                    done();
                });
            })
            it('should get invoked on sync reference ready, when we are already listening to parent location', function(done){
                var ref1 = pubnub.sync(seed + 'a.b.c');
                var ref2 = pubnub.sync(seed + 'a.b.c.d.e.f');
                ref2.on.ready(function(r){
                    assert.ok(true,"Ready should be called");
                    ref2.on.ready();
                    done();
                });
            })
        })
        describe('#on.merge()', function(){
            var seed = Date.now() + '-merge-';

            it('should get invoked when merge happens', function(done){
                var ref = pubnub.sync(seed + 'a.b.c.d');
                ref.on.merge(function(r){
                    assert.deepEqual(r.value(),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    ref.merge(seed);
                })

            })
        })

        describe('#on.replace()', function(){
            var seed = Date.now() + '-replace-';

            it('should get invoked when replace happens', function(done){
                var ref = pubnub.sync(seed + 'a.b.c.d');
                ref.on.replace(function(r){
                    assert.deepEqual(r.value(),seed + 2);
                    assert.ok(true,"replace should be called");
                    ref.on.replace();
                    done();
                });
                ref.on.ready(function(r){
                    ref.replace(seed + 2);
                })

            })
        })
        
        describe('#on.remove()', function(){
            var seed = Date.now() + '-remove-';

            it('should get invoked when remove happens', function(done){
                var ref = pubnub.sync(seed + 'a.b.c.d');
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
                    ref.merge(seed + 3)
                })

            })
        })
        
        describe('#on.change()', function(){
            
            it('should get invoked when merge happens', function(done){
                var seed = Date.now() + '-change-1';
                var ref = pubnub.sync(seed + 'a.b.c.d');

                ref.on.change(function(r){
                    assert.deepEqual(r.value(),seed + 1);
                    assert.ok(true,"Change should be called");
                    ref.on.change();
                    done();
                });
                ref.on.ready(function(r){
                    ref.merge(seed + 1);
                })
            })
            
            it('should get invoked when replace happens', function(done){
                var seed = Date.now() + '-change-2';
                var ref = pubnub.sync(seed + 'a.b.c.d');

                ref.on.change(function(r){
                    assert.deepEqual(r.value(),seed + 2);
                    assert.ok(true,"Change should be called");
                    ref.on.change();
                    done();
                });
                ref.on.ready(function(r){
                    ref.replace(seed + 2);
                })

            })
            
            
            it('should get invoked when remove happens', function(done){
                var seed = Date.now() + '-change-3';
                var ref = pubnub.sync(seed + 'a.b.c.d');

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
                    ref.merge(seed + 3)
                })
            })
            
        }) 
    })
})
