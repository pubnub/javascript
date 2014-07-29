

function DataSync(object_id, read_key, write_key, auth_key) {
	var publish_key 	= args['read_key']
	,	subscribe_key 	= args['write_key']
	, 	auth_key		= args['auth_key']
	,	object_id_split = object_id.split('.')
	,   data_sync_object = {
		'on' : {}
	};


	var obj_id 			= object_id_split[0];
	object_id_split.shift();
	var path 			= object_id_split.join('.');

	var pubnub = PUBNUB.init({
		'publish_key' 	: publish_key,
		'subscribe_key'	: subscribe_key,
		'auth_key'		: auth_key
	});

	data_sync_object.on.ready 	= args['on_ready'] 	|| function(){};
	data_sync_object['on_update'] 	= args['on_update'] || function(){};
	data_sync_object['on_remove'] 	= args['on_remove'] || function(){};
	data_sync_object['on_set'] 		= args['on_set'] 	|| function(){};
	data_sync_object['on_error'] 	= args['on_error'] 	|| function(){};
	data_sync_object['on_change'] 	= args['on_change'];

	pubnub.get_synced_object({
		'object_id'		: obj_id,
		'path'			: path,
		'connect'		: function(r) {

		},
		'success'		: function(r) {

		},
		'error'			: function(r) {

		},
		'disconnect' 	: function(r) {

		},
		'reconnect'		: fu
	})


}