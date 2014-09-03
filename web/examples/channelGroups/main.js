var PUB_KEY = $("#pub_key").val();
var SUB_KEY = $("#sub_key").val();
var SECRET_KEY = $("#secret_key").val();
var UUID = $("#uuid").val();

var namespaceEnable = $("#namespaceEnable").prop('checked');
var namespace = namespaceEnable && $("#namespace").val().length > 0 ? $("#namespace").val() : false;

var channelGroupEnable = $("#channelGroupEnable").prop('checked');
var channelGroup = channelGroupEnable && $("#channelGroup").val().length > 0 ? $("#channelGroup").val() : false;

var channelEnable = $("#channelEnable").prop('checked');
var channel = channelEnable && $("#channel").val().length > 0 ? $("#channel").val() : false;

var authEnable = $("#authEnable").prop('checked');
var auth = authEnable && $("#auth").val().length > 0 ? $("#auth").val() : false;

var message = $("#message").val().length > 0 ? $("#message").val() : null;

    pubnub = PUBNUB.init({
        "subscribe_key": SUB_KEY,
        "publish_key": PUB_KEY,
        "secrect_key": SECRET_KEY,
        "uuid": UUID
    });

pubnub.auth(auth);



function pnTime(){
    pubnub.time(
        function(time){
            console.log(time);
            $("#output").html(time);
        }
    );
}

function pnPublish(){
    if (channel) {
        pubnub.publish({
            channel: channel,
            message: $("#message").val(),
            callback: function(r){
                console.log(JSON.stringify(r));
                $("#output").html(JSON.stringify(r));
            },
            error: function(r){
                console.log(JSON.stringify(r));
                $("#output").html(JSON.stringify(r));
            }
        });
    }
}

$("#publish").click(function(){
   pnPublish();
});

$("#time").click(function(){
    pnTime();
});
