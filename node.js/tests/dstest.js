var assert = require('assert');
var PUBNUB = require('../pubnub.js');

var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "pubsub.pubnub.com",
    build_u       : true
});

var channel = 'javascript-test-channel-' + Date.now();
var count = 0;

deepEqual = assert.deepEqual;

function expect(total, done) {
    return function() {
        if (!--total) done();
    } 
}

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

function pn_random(){
    return Math.floor((Math.random() * 100000000000000000000) + 1);
}

describe('Pubnub', function() {

    this.timeout(40000);
    describe('#each()', function(){
        it("should be able to iterate over a list", function(done) {
            var seed                 = pn_random() + '-ready-';
            var location             = seed + 'office.occupants';
            var occupants_list         = ["a", "b", "c", "d"];

            pubnub.merge(location, occupants_list,
                function(r) {
                    var occupants = pubnub.sync(location);
                    occupants.on.ready(function(r){

                        r.each(function(occupant){
                            assert.ok(in_list(occupants_list, occupant.value()), "Occupant present in list");
                        });


                        assert.ok(r.value().length == occupants_list.length);
                        done();
                    });
                },
                function(r) {
                    assert.ok(false, "error occurred");
                }
            )

        })
    })

    describe('#push()', function(){
        it("should be able to push data to list", function(done) {
            var seed             = pn_random() + '-ready-';
            var location         = seed + 'office.occupants';
            var students_list    = ["a", "b", "c", "d"];
            var done_count       = 4;

            var students         = pubnub.sync(seed + '.students');

            students.on.ready(function(ref){
                students.push("a", function(){
                    students.push("b", function(){
                        students.push("c", function(){
                            students.push("d");
                        });
                    });
                });
                
            })
            students.on.merge(function(ref){
                assert.deepEqual(ref.value(), students_list.slice(0,ref.value().length));
                if (!--done_count) done();
            })

        });
    })

    describe('#push_with_sort_key()', function(){
        it("should be able to push data with sort key", function(done) {

            var seed             = pn_random() + '-ready-';
            var location         = seed + 'office.occupants';
            var students_list    = ["a", "b", "c", "d"];
            var done_count       = 4;
            var students         = pubnub.sync(seed + '.students');

            students.on.ready(function(ref){
                students.push_with_sort_key("d", "z", function(){
                    students.push_with_sort_key("c", "s", function(){
                        students.push_with_sort_key("b", "d", function(){
                            students.push_with_sort_key("a", "b");
                        });
                    });
                });
            })
            students.on.merge(function(ref){
                assert.deepEqual(ref.value().sort(), ref.value());
                if (!--done_count) done();
            })

        });
    })

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
            it('should get invoked on sync reference ready, when we are already listening to parent location and child references were created using get', function(done){
                var ref1 = pubnub.sync(seed + 'x.y.z');
                var ref2 = ref1.get('x1.y1.z1');

                ref2.on.ready(function(r){
                    assert.ok(true,"Ready should be called");
                    ref2.on.ready();
                    done();
                });
            })
            it("should be invoked properly when listening at multiple locations in same tree", function(done) {
                var done_count = 6;
                var seed = pn_random() + '-ready-';
                var r1 = pubnub.sync(seed + 'a.b.c');

                var r2 = pubnub.sync(seed + 'a.b');

                var r3 = r2.get('c.d');

                var r4 = r3.get('e').get('f');

                var r5 = r4.get('i.j.k');

                var r6 = pubnub.sync(seed + 'a.b.c.d.e.f.g.h.i.j.k.l');

                function ready(r) {
                    assert.ok(true, "Ready should be called");
                    if (!--done_count) done();
                }

                r1.on.ready(ready);
                r2.on.ready(ready);
                r3.on.ready(ready);
                r4.on.ready(ready);
                r5.on.ready(ready);
                r6.on.ready(ready);

            })
            it("should be invoked only when data object is ready", function(done) {
                var start = expect(6,done);

                var seed = pn_random() + '-ready-';

                var data = {
                    "a" : {
                        "b" : {
                            "c" : {
                                "d" : {
                                    "e" : {
                                        "f" : {
                                            "g" : {
                                                "h" : {
                                                    "i" : {
                                                        "j" : {
                                                            "k" : {
                                                                "l" : 'data' + seed
                                                            }
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                };

                pubnub.merge(
                    seed,
                    data,
                    function(r) {

                        var r1 = pubnub.sync(seed + '.a.b.c');

                        r1.on.ready(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), 'data' + seed);
                            start();
                        });

                        var r2 = pubnub.sync(seed + '.a.b');

                           r2.on.ready(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), 'data' + seed);
                            start();
                        });

                        var r3 = r2.get('c.d');

                        r3.on.ready(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), 'data' + seed);
                            start();
                        });

                        var r4 = r3.get('e').get('f');

                        r4.on.ready(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), 'data' + seed);
                            start();
                        });

                        var r5 = r4.get('g.h.i.j.k');

                        r5.on.ready(function(ref){
                            deepEqual(ref.value('l'), 'data' + seed);
                            start();
                        });

                        var r6 = pubnub.sync(seed + '.a.b.c.d.e.f.g.h.i.j.k.l');

                           r6.on.ready(function(ref){
                            deepEqual(ref.value(), 'data' + seed);
                            start();
                        });


                    },
                    function(r) {
                        ok(false);
                        start();
                    }
                )

            })
        })
        
        describe('#on.merge()', function(){
            
            
            it('should get invoked when merge happens', function(done){
                var seed = Date.now() + '-merge-1-';
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
            
            it('should get invoked when merge happens on child node', function(done){
                var seed = Date.now() + '-merge-2-';
                var ref = pubnub.sync(seed + 'a.b');
                ref.on.merge(function(r){
                    assert.deepEqual(r.value('c.d'),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    pubnub.merge(
                        seed + 'a.b.c.d',
                        seed,
                        function(r) {
                            assert.ok(true, 'Merge success')
                        },  
                        function(r) {
                            assert.ok(false, 'Error occurred in merge');
                            done();
                        }
                    )
                })

            })
            it('should get invoked when merge happens on child node, when listening to root', function(done){
                var seed = Date.now() + '-merge-3';
                var ref = pubnub.sync(seed);
                ref.on.merge(function(r){
                    assert.deepEqual(r.value('a.b.c.d'),seed);
                    assert.ok(true,"Merge should be called");
                    ref.on.merge();
                    done();
                });
                
                ref.on.ready(function(r){
                    pubnub.merge(
                        seed + '.a.b.c.d',
                        seed,
                        function(r) {
                            assert.ok(true, 'Merge success')
                        },  
                        function(r) {
                            assert.ok(false, 'Error occurred in merge');
                            done();
                        }
                    )
                })

            })
            it("should be work properly when listening to various locations in a tree", function(done) {
                var start = expect(12,done);
                
                var seed     = pn_random() + '-ready-';

                var val1      = 'data-1' + pn_random();
                var val2    = 'data-2' + pn_random();

                var data = {
                    "a" : {
                        "b" : {
                            "c" : {
                                "d" : {
                                    "e" : {
                                        "f" : {
                                            "g" : {
                                                "h" : {
                                                    "i" : {
                                                        "j" : {
                                                            "k" : {
                                                                "l" : val1
                                                            }
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                };

                pubnub.merge(
                    seed,
                    data,
                    function(r) {

                        var r1 = pubnub.sync(seed + '.a.b.c');

                        r1.on.ready(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val1);
                            start();
                        });

                        r1.on.merge(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val2);
                            start();
                        });


                        var r2 = pubnub.sync(seed + '.a.b');

                           r2.on.ready(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val1);
                            start();
                        });
                        r2.on.merge(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val2);
                            start();
                        });

                        var r3 = r2.get('c.d');

                        r3.on.ready(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), val1);
                            start();
                        });
                        r3.on.merge(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), val2);
                            start();
                        });

                        var r4 = r3.get('e').get('f');

                        r4.on.ready(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), val1);
                            start();
                        });
                        r4.on.merge(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), val2);
                            start();
                        });


                        var r5 = r4.get('g.h.i.j.k');

                        r5.on.ready(function(ref){
                            deepEqual(ref.value('l'), val1);
                            start();
                        });
                        r5.on.merge(function(ref){
                            deepEqual(ref.value('l'), val2);
                            start();
                        });

                        var r6 = pubnub.sync(seed + '.a.b.c.d.e.f.g.h.i.j.k.l');

                           r6.on.ready(function(ref){
                            deepEqual(ref.value(), val1);
                            r6.merge(val2);
                            start();
                        });
                        r6.on.merge(function(ref){
                            deepEqual(ref.value(), val2);
                            start();
                        });


                    },
                    function(r) {
                        ok(false);
                        start();
                    }
                )

            })
        })
        
        describe('#on.replace()', function(){
            

            it('should get invoked when replace happens', function(done){
                var seed = Date.now() + '-replace-1-';
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
            it('should get invoked when replace happens after remove', function(done){
                var seed = Date.now() + '-replace-2-';
                var ref = pubnub.sync(seed + 'a.b.c.d');
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
                    ref.replace(seed + 3);
                    ref.on.remove();
                });

                ref.on.ready(function(r){
                    ref.merge(seed + 2);
                })

            })
            it("should be work properly when listening to various locations in a tree", function(done) {
                var start = expect(18,done);
                
                var seed     = pn_random() + '-ready-';

                var val1      = 'data-1' + pn_random();
                var val2    = 'data-2' + pn_random();
                var val3    = 'data-3' + pn_random();

                var data = {
                    "a" : {
                        "b" : {
                            "c" : {
                                "d" : {
                                    "e" : {
                                        "f" : {
                                            "g" : {
                                                "h" : {
                                                    "i" : {
                                                        "j" : {
                                                            "k" : {
                                                                "l" : val1,
                                                                "l1" : val1 + val2
                                                            }
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                };

                pubnub.merge(
                    seed,
                    data,
                    function(r) {

                        var r1 = pubnub.sync(seed + '.a.b.c');

                        r1.on.ready(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val1);
                            start();
                        });

                        r1.on.merge(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val2);
                            start();
                        });

                        r1.on.replace(function(ref){
                            deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val3);
                            start();
                        });


                        var r2 = pubnub.sync(seed + '.a.b');

                           r2.on.ready(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val1);
                            start();
                        });
                        r2.on.merge(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val2);
                            start();
                        });
                        r2.on.replace(function(ref){
                            deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val3);
                            start();
                        });

                        var r3 = r2.get('c.d');

                        r3.on.ready(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), val1);
                            start();
                        });
                        r3.on.merge(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), val2);
                            start();
                        });
                        r3.on.replace(function(ref){
                            deepEqual(ref.value('e.f.g.h.i.j.k.l'), val3);
                            start();
                        });

                        var r4 = r3.get('e').get('f');

                        r4.on.ready(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), val1);
                            start();
                        });
                        r4.on.merge(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), val2);
                            start();
                        });
                        r4.on.replace(function(ref){
                            deepEqual(ref.value('g.h.i.j.k.l'), val3);
                            start();
                        });


                        var r5 = r4.get('g.h.i.j.k');

                        r5.on.ready(function(ref){
                            deepEqual(ref.value('l'), val1);
                            start();
                        });
                        r5.on.merge(function(ref){
                            deepEqual(ref.value('l'), val2);
                            start();
                        });
                        r5.on.replace(function(ref){
                            deepEqual(ref.value('l'), val3);
                            start();
                        });

                        var r6 = pubnub.sync(seed + '.a.b.c.d.e.f.g.h.i.j.k.l');

                           r6.on.ready(function(ref){
                            deepEqual(ref.value(), val1);
                            r6.merge(val2);
                            start();
                        });
                        r6.on.merge(function(ref){
                            deepEqual(ref.value(), val2);
                            r6.replace(val3);
                            start();
                        });
                        r6.on.replace(function(ref){
                            deepEqual(ref.value(), val3);
                            start();
                        });

                    },
                    function(r) {
                        ok(false);
                        start();
                    }
                )

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
            it("should be work properly when listening to various locations in a tree", function(done) {

                var seed     = pn_random() + '-ready-';

                var val1      = 'data-1' + pn_random();
                var val2    = 'data-2' + pn_random();
                var val3    = 'data-3' + pn_random();

                var data = {
                    "a" : {
                        "b" : {
                            "c" : {
                                "d" : {
                                    "e" : {
                                        "f" : {
                                            "g" : {
                                                "h" : {
                                                    "i" : {
                                                        "j" : {
                                                            "k" : {
                                                                "l" : val1,
                                                                "l1" : val1 + val2
                                                            }
                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                };

                pubnub.merge(
                    seed,
                    data,
                    function(r) {
                        var s = pubnub.sync(seed);
                        s.on.ready(function(ref){

                            assert.deepEqual(ref.value(), data);
                            pubnub.snapshot(seed, function(r){
                                //assert.deepEqual(ref.value(), r.value());
                            });
                        });

                        var r1 = pubnub.sync(seed + '.a.b.c');

                        r1.on.ready(function(ref){
                            assert.deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val1);
                        });

                        r1.on.merge(function(ref){
                            assert.deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val2);
                        });

                        r1.on.replace(function(ref){
                            assert.deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val3);
                            s.on.remove(function(r){
                                pubnub.snapshot(seed, function(r1){
                                    assert.deepEqual(r1.value(), r.value());
                                    done();
                                });
                            });
                            pubnub.remove(seed + '.a.b.c.d.e.f.g.h.i.j.k.l1');

                        });

                        r1.on.remove(function(ref){
                            assert.deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val3);
                            assert.deepEqual(ref.value('d.e.f.g.h.i.j.k.l1'), null);

                        });

                        var r2 = pubnub.sync(seed + '.a.b');

                           r2.on.ready(function(ref){
                            assert.deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val1);
                        });
                        r2.on.merge(function(ref){
                            assert.deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val2);
                        });
                        r2.on.replace(function(ref){
                            assert.deepEqual(ref.value('c.d.e.f.g.h.i.j.k.l'), val3);
                        });

                        var r3 = r2.get('c.d');

                        r3.on.ready(function(ref){
                            assert.deepEqual(ref.value('e.f.g.h.i.j.k.l'), val1);
                        });
                        r3.on.merge(function(ref){
                            assert.deepEqual(ref.value('e.f.g.h.i.j.k.l'), val2);
                        });
                        r3.on.replace(function(ref){
                            assert.deepEqual(ref.value('e.f.g.h.i.j.k.l'), val3);
                        });

                        var r4 = r3.get('e').get('f');

                        r4.on.ready(function(ref){
                            assert.deepEqual(ref.value('g.h.i.j.k.l'), val1);
                        });
                        r4.on.merge(function(ref){
                            assert.deepEqual(ref.value('g.h.i.j.k.l'), val2);
                        });
                        r4.on.replace(function(ref){
                            assert.deepEqual(ref.value('g.h.i.j.k.l'), val3);
                        });


                        var r5 = r4.get('g.h.i.j.k');

                        r5.on.ready(function(ref){
                            assert.deepEqual(ref.value('l'), val1);
                        });
                        r5.on.merge(function(ref){
                            assert.deepEqual(ref.value('l'), val2);
                        });
                        r5.on.replace(function(ref){
                            assert.deepEqual(ref.value('l'), val3);
                        });

                        var r6 = pubnub.sync(seed + '.a.b.c.d.e.f.g.h.i.j.k.l');

                           r6.on.ready(function(ref){
                            assert.deepEqual(ref.value(), val1);
                            r6.merge(val2);
                        });
                        r6.on.merge(function(ref){
                            assert.deepEqual(ref.value(), val2);
                            r6.replace(val3);
                        });
                        r6.on.replace(function(ref){
                            assert.deepEqual(ref.value(), val3);
                        });

                    },
                    function(r) {
                        assert.ok(false);
                    }
                )
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
