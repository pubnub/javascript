function log() {
    console.log.apply(console, arguments);
}

(function(){

PUBNUB.sync = function(name, path, callback, settings) {
    var datasync_server = 'http://dara-dev2.devbuild.pubnub.com:2111';

    var pubnub = PUBNUB.init(settings);

    var databaseName = '';
    var currentPath = '';

    var model = {};
    var self = function() { return model; }
    var on = {
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
    // ALL: Iterator
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    self.all = function(cb) {
        PUBNUB.each( model, function( id, data ) {
            cb({ id : id, data : data });
        } );
    };

    // --------------------------------
    // Helpers
    // --------------------------------

    function fireEvent(action, path, data) {
        // TODO
        console.log('event', action, path, data);
    }

    function updateModel(action, path, data) {
        var current = model;
        var last = model;
        if (path[0] == '.') {
            path = path.substr(1);
        }
        var split = path.split('.');
        for (var i = 0; i < split.length; i++) {
            last = current;
            current = current[split[i]];
        }

        if (action === 'update') {
            last[split[split.length - 1]] = data;
            on.change(path, data);
        } else if (action === 'delete') {
            if (path === '') {
                model = {};
            } else {
                delete last[split[split.length - 1]];
            }
            on.delete(path, data);
        } else if (action === 'get') {
            if (path === '') {
                return model;
            } else {
                return last[split[split.length - 1]];
            }
        }

    }

    function updateSubscription(callback) {
        var channel = 'pn_ds_' + databaseName;
        log("Subscribing to channel:", channel);

        pubnub.subscribe({
            channel : channel,
            callback : function(message, raw) {
                log("Received", message);

                // Strip channel name and database name
                var path = message.location.replace(channel, '');
                if (message.action === 'update') {
                    updateModel(message.action, path, message.value);
                } else if (message.action === 'delete') {
                    updateModel(message.action, path, message.value);
                }

                log('model after changes applied:', model);
            }
            , connect : function(message) {
                log("Connect");
                callback('connected');
            }
            , reconnect : function(message) { log("Reconnect"); }
            , disconnect : function(message) { log("Disconnect"); }
            , error : function(message) { log("Error"); }
        });
    }

    function getRemote(path, callback) {
        return $.ajax({
            url : datasync_server + '/datasync/sub-key/'+ settings.subscribe_key + '/obj-id/' + databaseName + '/' + path,
            dataType : 'json',
            success : function(data) {
                callback(data.payload);
            },
            error : function(xhr, type) {
                log('error', xhr, type);
            }
        });
    }

    // --------------------------------
    // Public API
    // --------------------------------

    function sync(name, path, callback) {
        databaseName = name;
        currentPath = path;

        getRemote(currentPath, function(data) {
            model = data;
            log('model set to', model);

            return updateSubscription(callback);
        });
    }

    function getPath(originalPath) {
        if (originalPath === '')
            return "";

        var path = '/' + originalPath;
        path = path.replace(/\//g, '.');
        return path
    }

    self.update = function (data, path, callback) {
        return $.ajax({
            type : 'PATCH',
            url : datasync_server + '/datasync/pub-key/' + settings.publish_key + '/sub-key/'+ settings.subscribe_key + '/obj-id/' + databaseName + '/' + path,
            data : JSON.stringify(data),
            dataType : 'json',
            success : function(response) {
                callback(response);
            },
            error : function(xhr, type) {
                log('error', xhr, type);
            }
        });
    };

    self.write = function (data, path) {
    };

    self.delete = function (origPath, callback) {
        return $.ajax({
            type : 'DELETE',
            url : origin + '/datasync/pub-key/' + settings.publish_key + '/sub-key/'+ settings.subscribe_key + '/obj-id/' + databaseName + '/' + path,
            success : function(response) {
                callback(response);
            },
            error : function(xhr, type) {
                log('error', xhr, type);
            }
        });
    };

    self.append = function (data) {
    };

    self.get = function (path) {
        return updateModel('get', path, null);
    };

    sync(name, path, callback);

    return self;
}

})();
