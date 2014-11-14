var pubnub = PUBNUB({
    write_key     : "pub-c-bf446f9e-dd7f-43fe-8736-d6e5dce3fe67",
    read_key      : "sub-c-d1c2cc5a-1102-11e4-8880-02ee2ddab7fe",
    origin        : "pubsub.pubnub.com"

});


function in_list(list,str) {
    for (var x in list) {
        if (list[x] == str) return true;
    }
    return false;
 }

 function in_list_deep(list,obj) {
    for (var x in list) {
        if (_.isEqual(list[x], obj)) return true;
    }
    return false;
 }

function pn_random(){
    return Math.floor((Math.random() * 100000000000000000000) + 1);
}

test("on.ready() should be invoked when sync reference ready", function() {
    expect(1);
    stop(1);
    var seed = pn_random() + '-ready-';
    var ref = pubnub.sync(seed + 'a.b');
    ref.on.ready(function(r){
        ok(true,"Ready should be called");
        ref.on.ready();
        start();
    });
});


test("each() should be able to iterate over a list", function() {
    expect(5);
    stop(2);
    var seed                 = pn_random() + '-ready-';
    var location             = seed + 'office.occupants';
    var occupants_list         = ["a", "b", "c", "d"];

    pubnub.merge(location, occupants_list,
        function(r) {
            start();
            var occupants = pubnub.sync(location);
            occupants.on.ready(function(r){

                r.each(function(occupant){
                    ok(in_list(occupants_list, occupant.value()), "Occupant present in list");
                });


                ok(r.value().length == occupants_list.length);
                start();
            });
        },
        function(r) {
            ok(false, "error occurred");
            start();
        }
    )


});


test("on.ready() should be invoked properly when listening at multiple locations in same tree", function() {
    expect(6);
    stop(6);
    var seed = pn_random() + '-ready-';
    var r1 = pubnub.sync(seed + 'a.b.c');

    var r2 = pubnub.sync(seed + 'a.b');

    var r3 = r2.get('c.d');

    var r4 = r3.get('e').get('f');

    var r5 = r4.get('i.j.k');

    var r6 = pubnub.sync(seed + 'a.b.c.d.e.f.g.h.i.j.k.l');

    function ready(r) {
        ok(true, "Ready should be called");
        start();
    }

    r1.on.ready(ready);
    r2.on.ready(ready);
    r3.on.ready(ready);
    r4.on.ready(ready);
    r5.on.ready(ready);
    r6.on.ready(ready);

});


test("on.ready() should be invoked only when data object is ready", function() {
    expect(6);
    stop(6);
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

});

test("on.merge() should be work propertly when listening to various locations in a tree", function() {
    expect(12);
    stop(12);
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

});

test("on.replace() should be work propertly when listening to various locations in a tree", function() {
    expect(18);
    stop(18);
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

});

test("on.remove() should be work properly when listening to various locations in a tree", function() {
    expect(21);
    stop(20);
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
                deepEqual(ref.value(), data);
                start();
            });

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
                pubnub.remove(seed + '.a.b.c.d.e.f.g.h.i.j.k.l1');
                start();
            });

            r1.on.remove(function(ref){
                deepEqual(ref.value('d.e.f.g.h.i.j.k.l'), val3);
                deepEqual(ref.value('d.e.f.g.h.i.j.k.l1'), null);
                start();
            });

            r1.on.resync(function(ref){
                console.log('RESYNC DONE');
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
});
