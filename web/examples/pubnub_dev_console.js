function clearOutputs(){
    document.getElementById("error").innerHTML="No errors.";
    document.getElementById("output").innerHTML="No output.";
}

pubnub_dev_console = function(){

    function getAuthKey(defaultEntry){
        if (!defaultEntry) {
            defaultEntry = "";
        }
        var key = get_input('Enter Auth Key or "none" for no auth', "string", defaultEntry);
        if (key == "none") {
            key = "";
        }
        return key;
    }

    function get_input(msg, type, def_val) {

        if (type == "number") {
            var number;
            do {
                number = parseInt(prompt(msg,def_val))
            } while (isNaN(number));
            return number;
        }

        if (type == "boolean") {
            var bool = confirm(msg);
            return bool;
        }
        if (type == "string") {
            var str;
            do {
                str = prompt(msg,def_val);
            } while(!str || !str.length);
            return str;
        }
        alert("Invalid input type");
        return;
    }
    function print(r) {
        output = JSON.stringify(r);
        console.log(output);
        document.getElementById('output').innerHTML=output;
    }

    function error(e) {
        output = JSON.stringify(e);
        console.log(output);
        document.getElementById('error').innerHTML=output;
    }

    var pubnub = PUBNUB.init({
        'publish_key' : 'demo',
        'subscribe_key' : 'demo'
    });

    SELF = {

        'init'  : function(origin, pub_key, sub_key, sec_key, auth_key, ssl) {
            origin   = origin   || get_input("Enter origin", "string", "pubsub.pubnub.com");
            pub_key  = pub_key  || get_input("Enter publish key", "string", "demo");
            sub_key  = sub_key  || get_input("Enter subscribe key", "string", "demo" );
            sec_key  = sec_key  || get_input("Enter secret key", "string", "demo");
            auth_key = auth_key || getAuthKey("myAuthKey");
            ssl      = ssl      || get_input("SSL ?", "boolean", false);
            var d = {};
            d['origin'] = origin;
            d['publish_key'] = pub_key;
            d['subscribe_key'] = sub_key;
            if (sec_key) d['secret_key'] = sec_key;
            if (auth_key) {
              d['auth_key'] = auth_key;
              document.getElementById('currentAuthKey').innerHTML="current auth key is: " + auth_key;
            }
            d['ssl'] = ssl;
            pubnub = PUBNUB.init(d);
            return "Pubnub Object Initialized";
        },

        'input' : function(input) {
            var count = 0;
            var input_table = {};
            var SUBSCRIBE         = ++count;
            var PUBLISH           = ++count;
            var HISTORY           = ++count;
            var HERE_NOW          = ++count;
            var UNSUBSCRIBE        = ++count;
            var TIME            = ++count;
            var SET_AUTH_KEY    = ++count;
            var PAM_GRANT       = ++count;
            var PAM_REVOKE      = ++count;
            var PAM_AUDIT       = ++count;
            var FALLBACK  = ++count;

            if (!input) {
                input = get_input("Enter command", "number");
            }


            switch(input) {

                case SUBSCRIBE:
                    var channel = get_input("Enter channel", "string", "hello_world");
                    pubnub.subscribe({
                        'channel'     : channel,
                        'callback'    : print,
                        'error'       : error
                    });
                break;
                case PUBLISH:
                    var channel = get_input("Enter channel", "string", "hello_world");
                    var message = get_input("Enter Message", "string", "Hi");
                    pubnub.publish({
                        'channel'     : channel,
                        'message'     : message,
                        'callback'    : print,
                        'error'       : error
                    });
                    break;
                case HISTORY:
                    var channel = get_input("Enter channel", "string", "hello_world");
                    var count = get_input("Enter count", "number", 10);
                    var reverse = get_input("Reverse ?", "boolean");
                    pubnub.history({
                        'channel'     : channel,
                        'count'       : count,
                        'reverse'     : reverse,
                        'callback'    : print,
                        'error'       : error
                    });
                    break;
                case HERE_NOW:
                    var channel = get_input("Enter channel", "string", "hello_world");
                    pubnub.here_now({
                        'channel'  : channel,
                        'callback' : print,
                        'error'    : error
                    });
                    break;
                case UNSUBSCRIBE:
                    var channel = get_input("Enter channel", "string", "hello_world");
                    pubnub.unsubscribe({
                        'channel' : channel
                    });
                    break;
                case TIME:
                    pubnub.time(print);
                    break;
                case SET_AUTH_KEY:
                    var key = getAuthKey("myAuthKey");
                    pubnub.auth(key);
                    document.getElementById('currentAuthKey').innerHTML="current auth key is: " + key;
                    break;
                case PAM_GRANT:
                    var channel =  get_input("Enter channel", "string", "hello_world");
                    var key = getAuthKey();
                    var read = get_input("Read Permission Allowed ?", "boolean");
                    var write = get_input("Write Permission Allowed ?", "boolean");
                    var ttl = get_input("Enter ttl", "number", 5);
                    pubnub.grant({
                        'channel'     : channel,
                        'auth_key'    : key,
                        'read'        : read,
                        'write'       : write,
                        'ttl'         : ttl,
                        'callback'    : print,
                        'print'       : print
                    });
                    break;
                case PAM_REVOKE:
                    var channel =  get_input("Enter channel", "string", "hello_world");
                    var key = getAuthKey();
                    pubnub.revoke({
                        'channel'     : channel,
                        'auth_key'    : key,
                        'callback'    : print,
                        'error'       : error
                    });
                    break;
                case PAM_AUDIT:
                    var channel =  get_input("Enter channel", "string", "");
                    var key = getAuthKey();
                    var d = {}
                    d['callback'] = print;
                    if (channel && channel.trim().length) d['channel'] = channel;
                    if (key && key.trim().length) d['auth_key'] = key;
                     pubnub.audit(d);
                    break;

                case FALLBACK:
                    break;
                default:
                    break;
            }
            return "Request Successful";
        }
    };
    return SELF;
}
dev_console = pubnub_dev_console();
