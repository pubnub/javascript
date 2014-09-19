var settings = {
    publish_key  : 'demo',
    subscribe_key  : 'demo'
};

var game = PUBNUB.sync('game20', '', function() {

    game.on.change(function(data) {
        log('change:', data);
    });

    game.on.delete(function(data) {
        log('delete:', data);
    });

    log('read', game.get('z.sub1'));

    /*
    game.update({
        's2' : 'ss2.2'
    }, '', function(response) {
        log('wrote', response);
    });
    */

    /*
    game.delete('', function(response) {
        log('deleted success');
    });
    */
},
settings);
