    var pubnub = PUBNUB.init({
        publish_key       : 'demo',
        subscribe_key     : 'demo'
    });

    var channel = 'javascript-test-channel-' + Date.now();
    var count = 0;

    var message_string = 'Hi from Javascript';
    var message_jsono = {'message': 'Hi Hi from Javascript'};
    var message_jsona = ['message' , 'Hi Hi from javascript'];

    function eql(a,b,done) {
        try {
            expect(a).to.eql(b);
        } catch (x) {
            return x;
        }
    }

    function ok(a,done) {
        try {
            expect(a).to.be.ok;
        } catch (x) {
            return x;
        }
    }

    function equal(a,b,done) {
        try {
            expect(a).to.equal(b);
        } catch (x) {
            return x;
        }
    }

    describe('Pubnub', function() {

        describe('#publish()', function(){
            it('should publish strings without error', function(done){
                var x;
                this.timeout(40000);
                var ch = channel + '-' + ++count;
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : message_string,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response,message_string) || x;
                        pubnub.unsubscribe({channel : ch});
                        done(x);
                    }

                })
            })
            it('should publish json objects without error', function(done){
                this.timeout(40000);
                var ch = channel + '-' + ++count;
                var x;
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : message_jsono,
                            callback : function(response) {
                                x = equal(response[0],1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response,message_jsono) || x;
                        pubnub.unsubscribe({channel : ch});
                        done(x);
                    }

                })
            })
            it('should publish json arrays without error', function(done){
                this.timeout(40000);
                var x;
                var ch = channel + '-' + ++count ;
                pubnub.subscribe({channel : ch ,
                    connect : function(response) {
                        pubnub.publish({channel: ch , message : message_jsona,
                            callback : function(response) {
                                x = equal(response[0],1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response,message_jsona) || x;
                        pubnub.unsubscribe({channel : ch});
                        done(x);
                    }

                })
            })

            it('should publish multiple messages on multiple channels without failure', function(done){
                this.timeout(200000);
                var x;
                var ch1 = channel + '-array-' + ++count ;
                var msg1 = [ 'message' , ch1 ];
                pubnub.subscribe({channel : ch1 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch1 , message : msg1,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg1) || x;
                        pubnub.unsubscribe({channel : ch1});
                    }

                })
                var ch2 = channel + '-array-' + ++count ;
                var msg2 = [ 'message' , ch2 ];
                pubnub.subscribe({channel : ch2 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch2 , message : msg2,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg2) || x;
                        pubnub.unsubscribe({channel : ch2});
                    }

                })
                var ch3 = channel + '-array-' + ++count ;
                var msg3 = [ 'message' , ch3 ];
                pubnub.subscribe({channel : ch3 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch3 , message : msg3,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg3) || x;
                        pubnub.unsubscribe({channel : ch3});
                    }

                })
                var ch4 = channel + '-array-' + ++count ;
                var msg4 = [ 'message' , ch4 ];
                pubnub.subscribe({channel : ch4 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch4 , message : msg4,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg4) || x;
                        pubnub.unsubscribe({channel : ch4});
                    }

                })
                var ch5 = channel + '-array-' + ++count ;
                var msg5 = [ 'message' , ch5 ];
                pubnub.subscribe({channel : ch5 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch5 , message : msg5,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg5) || x;
                        pubnub.unsubscribe({channel : ch5});
                    }

                })
                var ch6 = channel + '-array-' + ++count ;
                var msg6 = [ 'message' , ch6 ];
                pubnub.subscribe({channel : ch6 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch6 , message : msg6,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg6) || x;
                        pubnub.unsubscribe({channel : ch6});
                    }

                })
                var ch7 = channel + '-array-' + ++count ;
                var msg7 = [ 'message' , ch7 ];
                pubnub.subscribe({channel : ch7 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch7 , message : msg7,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg7) || x;
                        pubnub.unsubscribe({channel : ch7});
                    }

                })
                var ch8 = channel + '-array-' + ++count ;
                var msg8 = [ 'message' , ch8 ];
                pubnub.subscribe({channel : ch8 ,
                    connect : function(response) {
                        pubnub.publish({channel: ch8 , message : msg8,
                            callback : function(response) {
                                x = equal(response[0], 1) || x;
                            }
                        });
                    },
                    callback : function(response) {
                        x = eql(response, msg8)  || x;
                        pubnub.unsubscribe({channel : ch8});
                        done(x);
                    }

                })

            })
        })
        describe('#time()', function() {
            it('should return time successfully when called', function(done){
                var x;
                this.timeout(40000);
                pubnub.time(function(time) {
                    x = ok(time) || x;
                    done(x);
                })
            })

        })
        describe('#uuid()', function() {
            it('should return uuid successfully when called', function(done){
                var x;
                this.timeout(40000);
                pubnub.uuid(function(uuid) {
                    x = ok(uuid) || x;
                    done(x);
                })
            })

        })
        describe('#here_now()', function() {

            it('should show occupancy 1 user if 1 user is subscribed to channel', function(done){
                this.timeout(80000);
                var x;
                var ch = channel + '-' + 'here-now' ;
                    pubnub.subscribe({channel : ch ,
                        connect : function(response) {
                            setTimeout(function() {
                                pubnub.here_now( {channel : ch, callback : function(data) {
                                    x = equal(data.occupancy, 1) || x;
                                    pubnub.unsubscribe({channel : ch});
                                }})}, 10000
                            );
                            pubnub.publish({channel: ch , message : message_jsona,
                                callback : function(response) {
                                    x = equal(response[0],1) || x;
                                }
                            });
                        },
                        callback : function(response) {
                            x = eql(response, message_jsona) || x;
                            done(x)
                        }

                    })

            })

        })
        describe('#history()', function(){
            var history_channel = channel + '-history';

            before(function(done){
                this.timeout(40000);
                var x;
                pubnub.publish({channel: history_channel,
                    message : message_string,
                    callback : function(response){
                        x = equal(response[0], 1) || x;}
                    });
                pubnub.publish({channel: history_channel,
                    message : message_string,
                    callback : function(response){
                        x = eql(response[0], 1) || x;
                        done();
                    }
                });

            })
            it('should return 2 messages when 2 messages were published on channel', function(done) {
                var x;
                this.timeout(40000);
                setTimeout(function() {
                    pubnub.history({channel : history_channel,
                        callback : function(response) {
                            x = equal(response[0].length, 2) || x;
                            done(x);
                        }
                    })
                },5000);
            })
            it('should return 1 message when 2 messages were published on channel and count is 1', function(done) {
                var x;
                this.timeout(40000);
                setTimeout(function() {
                    pubnub.history({channel : history_channel,
                        count : 1,
                        callback : function(response) {
                            x = equal(response[0].length, 1) || x;
                            done(x);
                        }
                    })
                },5000);
            })
        })

})
