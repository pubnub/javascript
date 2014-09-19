(function(){

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// SYNC
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
PUBNUB.sync = function( name, settings ) {
    //var pubnub       = PUBNUB.secure(settings)
    var pubnub       = PUBNUB.init(settings)
    ,   start_at     = (settings.start || 0) * 10000
    ,   db           = storage().get('db-'+name)      || {}
    ,   tranlog      = storage().get('tranlog-'+name) || {}
    ,   binlog       = storage().get('binlog-'+name)  || []
    ,   lastime      = start_at || storage().get('lastime-'+name) || 0
    ,   connected    = false
    ,   transmitting = false
    ,   self         = function() { return db }
    ,   on           = {
            create     : function() {}
        ,   change     : function() {}
        ,   update     : function() {}
        ,   delete     : function() {}
        ,   debug      : function() {}
        ,   connect    : function() {}
        ,   disconnect : function() {}
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // BINDING EVENTS FOR USER
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.on = function( method, cb )  { on[method]    = cb };
    self.on.create     = function(cb) { on.create     = cb };
    self.on.change     = function(cb) { on.change     = cb };
    self.on.update     = function(cb) { on.update     = cb };
    self.on.delete     = function(cb) { on.delete     = cb };
    self.on.remove     = function(cb) { on.delete     = cb };
    self.on.debug      = function(cb) { on.debug      = cb };
    self.on.connect    = function(cb) { on.connect    = cb };
    self.on.disconnect = function(cb) { on.disconnect = cb };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // SYNC DB
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    sync_db();
    function sync_db() {
        sync_binlog({
            net      : pubnub
        ,   channel  : name
        ,   limit    : settings.limit || 10000
        ,   start    : lastime
        ,   callback : function( evts, timetoken ) {
                pubnub.subscribe({
                    backfill   : true
                ,   channel    : name
                ,   message    : function( m, e ){ receiver( m, e[1] ) }
                ,   disconnect : function() {
                        connected = false;
                        on.debug('disconnected from internet');
                        on.disconnect('disconnected from internet');
                        pubnub.unsubscribe({ channel : name });
                        sync_db();
                    }
                });
            }
        ,   progress : function( evts, timetoken ) {
                PUBNUB.each( evts, function(evt){ 
                    receiver( evt, timetoken );
                } );

                // Connection User Callbacks
                if (connected) return;
                connected = true;
                on.debug('connected to internet');
                on.connect('connected to internet');
            }
        });
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // COMMIT RECEIVER OF REMOTE SYNC DATA
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function receiver( evt, timetoken ) {
        var id      = evt.id
        ,   domain  = evt.domain
        ,   command = evt.command
        ,   data    = evt.data;

        // Leave if non-good evt
        if (!(id && domain && command && data)) return;

        // Save binlog point
        storage().set( 'lastime-'+name, lastime=timetoken );

        // Leave if Event Processed
        if (domain in tranlog) return;
        tranlog[domain] = 1;
        storage().set( 'tranlog-'+name, tranlog );

        // Merge Event
        if (command == "create") db[id] = data;
        if (command == "update") db[id] = data;
        if (command == "delete") delete db[id];

        // Save Commit
        storage().set( 'db-'+name, db );

        // User Callbacks
        on[command](evt);
        if (command != "delete") on.change(evt);

    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // ALL: Iterator
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.all = function(cb) {
        PUBNUB.each( db, function( id, data ) {
            cb({ id : id, data : data });
        } );
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // DESTROY SELF: Totally Start Over
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.destroy = function() {
        pubnub.unsubscribe({ channel : name });
        storage().del('lastime-'+name);
        self.clear_local_db();
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // CLEAR LOCAL DATABASE
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.clear_local_db = function() {
        storage().del('db-'+name);
        storage().del('tranlog-'+name);
        storage().del('binlog-'+name);
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // CREATE
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.create = function( data, id ) {
        if (record_too_large(data)) {
            on.debug('ALERT: Record Too Large');
            return false;
        }

        var id = execute( 'create', data, id );
        db[id] = data;
        var ref = reference(id);

        // Save Local DB
        storage().set( 'db-'+name, db );
        on.create(ref);
        on.change(ref);

        return ref;
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // READ
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.read = function(id) {
        return reference(id);
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // UPDATE
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.update = function( id, data ) {
        execute( 'update', merge( db[id]||{}, data ), id );
        storage().set( 'db-'+name, db );
        var ref = reference(id);
        on.update(ref);
        on.change(ref);
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // DELETE
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.delete = function(id) {
        execute( 'delete', db[id], id );
        on.delete(reference(id));
        delete db[id];
        storage().set( 'db-'+name, db );
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // DELETE_ALL
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.delete_all = function(cb) {
        PUBNUB.each( db, self.delete );
        storage().set( 'db-'+name, db={} );

        (cb||function(){})();
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // FIND
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.find = function(query) {
        var found = [];
        PUBNUB.each( query, function( key, val ) {
            PUBNUB.each( db, function( id, row ) {
                if (key in row && val == row[key]) found.push(reference(id));
            } );
        } );
        return found;
    };

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // MAKE REFERENCE OBJECT
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function reference(id) {
        var ref    = { id : id, data : db[id] };
        ref.delete = function()     { self.delete(id)         };
        ref.update = function(data) { self.update( id, data ) };
        return ref;
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // CREATE, UPDATE, DELETE TRANSACTION MANAGER
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function execute( command, data, id ) {
        var id     = id || PUBNUB.uuid()
        ,   domain = PUBNUB.uuid();

        binlog.push({
                id      : id
            ,   domain  : domain
            ,   command : command
            ,   data    : data
        });

        tranlog[domain] = 1;
        storage().set( 'tranlog-'+name, tranlog );
        storage().set( 'binlog-'+name, binlog );

        commit();

        return id;
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Record Too Large
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function record_too_large(message) {
        return encodeURIComponent(JSON.stringify(message)).length > 7000;
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // COMMIT
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function commit() {
        on.debug(binlog.length + ' untransmitted commits remaining');

        var transaction = binlog[0];
        if (!transaction || transmitting) return;
        transmitting = true;

        pubnub.publish({
            channel  : name
        ,   message  : transaction
        ,   error    : next_commit
        ,   callback : next_commit
        });
    }

    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // NEXT COMMIT
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    function next_commit(info) {
        transmitting = false;
        var success = info && info[0];

        setTimeout( commit, success ? 10 : 1000 );
        if (!success) return;

        binlog.shift();
        storage().set( 'binlog-'+name, binlog );
    }

    return self;
};


// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// SYNC BINLOG
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
function sync_binlog(args) {
    var channel  = args['channel']
    ,   callback = args['callback'] || function(){}
    ,   progress = args['progress'] || function(){}
    ,   limit    = args['limit']    || 5
    ,   start    = args['start']    || 0
    ,   net      = args['net']
    ,   count    = 100
    ,   binlog   = []
    ,   params   = {
        channel  : channel,
        count    : count,
        start    : start,
        reverse  : true,
        error    : retry,
        callback : receiver
    };

    fetch_binlog();

    function receiver(messages) {
        var msgs     = messages[0];
        start        = messages[2];
        params.start = start;

        PUBNUB.each( msgs.reverse(), function(m) {binlog.push(m)} );

        progress( msgs.reverse(), start );

        // if done then call last user cb
        if ( binlog.length >= limit ||
             msgs.length   <  count
        ) return callback( binlog, start );

        fetch_binlog();
    }

    function retry(info) {
        setTimeout( fetch_binlog, 1000 );
    }

    function fetch_binlog() { net.history(params) }
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// LOCAL MEMORY STORAGE MERGE
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var each = PUBNUB.each;
function merge( target, src ) {
    each( src, function (key) {
        if (src[key] == null) { delete target[key]; return; }
        if (typeof src[key] !== 'object' || !src[key]) target[key] = src[key];
        else {
            if (!target[key]) target[key] = src[key]
            else target[key] = merge( target[key], src[key] )
        }
    } );
    return target;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// LOCAL DISK STORAGE
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function storage() {
    var ls = window['localStorage'];
    return {
        'get' : function(key) {
            try {
                if (ls) return JSON.parse(ls.getItem(key));
            } catch(e) { return }
        },
        'del' : function(key) {
            try {
                if (ls) return ls.removeItem(key);
            } catch(e) { return }
        },
        'set' : function( key, value ) {
            try {
                if (ls) return ls.setItem( key, JSON.stringify(value) ) && 0;
            } catch(e) { return }
        }
    };
}

})();
