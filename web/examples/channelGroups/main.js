var PUB_KEY = $("#pub_key").val();
var SUB_KEY = $("#sub_key").val();
var SECRET_KEY = $("#secret_key").val();
var UUID = $("#uuid").val();

function namespaceInit() {
    namespaceEnable = $("#namespaceEnable").prop('checked');
    namespace = namespaceEnable && $("#namespace").val().length > 0 ? $("#namespace").val() : false;
}

namespaceInit();
$("#namespace").bind("change", function () {
    namespaceInit()
});

function channelGroupInit() {
    channelGroupEnable = $("#channelGroupEnable").prop('checked');
    channelGroup = channelGroupEnable && $("#channelGroup").val().length > 0 ? $("#channelGroup").val() : false;
}

channelGroupInit();
$("#channelGroup").bind("change", function () {
    channelGroupInit()
});

function channelInit() {
    channelEnable = $("#channelEnable").prop('checked');
    channel = channelEnable && $("#channel").val().length > 0 ? $("#channel").val() : false;
}

channelInit();
$("#channel").bind("change", function () {
    channelInit()
});

function authInit() {
    authEnable = $("#authEnable").prop('checked');
    auth = authEnable && $("#auth").val().length > 0 ? $("#auth").val() : false;
}

authInit();
$("#auth").bind("change", function () {
    authInit()
});

function messageInit() {
    message = $("#message").val().length > 0 ? $("#message").val() : null;
}

messageInit();
$("#message").bind("change", function () {
    messageInit();
});

pubnub = PUBNUB.init({
    "subscribe_key": SUB_KEY,
    "publish_key": PUB_KEY,
    "secrect_key": SECRET_KEY,
    "uuid": UUID
});


function pnTime() {
    pubnub.time(
        function (time) {
            console.log(time);
            $("#output").html(time);
        }
    );
}

function pnPublish() {
    if (channel) {
        pubnub.publish({
            channel: channel,
            message: $("#message").val(),
            callback: displayCallback,
            error: displayCallback
        });
    }
}

function displayCallback(m, e, c) {
    if (c) {
        console.log(JSON.stringify(c + ": " + m));
        $("#output").html(c + ":" + JSON.stringify(m) + "\n" + $("#output").html());


    } else {
        console.log(JSON.stringify(m));
        $("#output").html(JSON.stringify(m) + "\n" + $("#output").html());

    }
}

function pnSubscribe() {
    if (channel) {
        pubnub.subscribe({
            channel: channel,
            callback: displayCallback,
            error: displayCallback
        });
    } else if (channelGroup) {
        pubnub.subscribe({
            registry: channelGroup,
            namespace: namespace,
            callback: displayCallback,
            error: displayCallback
        });
    }
}

function pnUnsubscribe() {
    if (channel) {
        pubnub.unsubscribe({
            channel: channel,
            callback: displayCallback,
            error: displayCallback
        });
    } else if (channelGroup) {
        pubnub.unsubscribe({
            registry: channelGroup,
            namespace: namespace,
            callback: displayCallback,
            error: displayCallback
        });
    }
}

$("#publish").click(function () {
    pnPublish();
});

$("#time").click(function () {
    pnTime();
});

$("#subscribe").click(function () {
    pnSubscribe();
});

$("#unsubscribe").click(function () {
    pnUnsubscribe();
});