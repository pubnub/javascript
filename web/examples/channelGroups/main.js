var PUB_KEY = $("#pub_key").val();
var SUB_KEY = $("#sub_key").val();
var SECRET_KEY = $("#secret_key").val();
var UUID = $("#uuid").val();


function stateInit() {
    stateEnable = $("#stateEnable").prop('checked');
    state = stateEnable && $("#state").val().length > 0 ? JSON.parse($("#state").val()) : false;
}
stateInit();
$("#state, #stateEnable").bind("change", function () {
    stateInit();
});

function channelGroupInit() {
    channelGroupEnable = $("#channelGroupEnable").prop('checked');
    channelGroup = channelGroupEnable && $("#channelGroup").val().length > 0 ? $("#channelGroup").val() : false;
}

channelGroupInit();
$("#channelGroup, #channelGroupEnable").bind("change", function () {
    channelGroupInit();
});

function channelInit() {
    channelEnable = $("#channelEnable").prop('checked');
    channel = channelEnable && $("#channel").val().length > 0 ? $("#channel").val() : false;
}

channelInit();
$("#channel, #channelEnable").bind("change", function () {
    channelInit();
});

function authInit() {
    authEnable = $("#authEnable").prop('checked');
    auth = authEnable && $("#auth").val().length > 0 ? $("#auth").val() : false;
    if (auth && typeof pubnub != "undefined") {
        pubnub.auth(auth);
    }
}

authInit();
$("#auth, #authEnable").bind("change", function () {
    authInit();
});

function pamAuthInit() {
    pamAuthEnable = $("#pamAuthEnable").prop('checked');
    pamAuth = pamAuthEnable && $("#pamAuth").val().length > 0 ? $("#pamAuth").val() : false;
}

pamAuthInit();
$("#pamAuth, #pamAuthEnable").bind("change", function () {
    pamAuthInit();
});


function messageInit() {
    message = $("#message").val().length > 0 ? $("#message").val() : null;
}

messageInit();
$("#message").bind("change", function () {
    messageInit();
});

function originInit() {
    origin = $("#origin").val().length > 0 ? $("#origin").val() : null;
}
originInit();
$("#origin").bind("change", function () {
    originInit();
});

pubnub = PUBNUB.init({
    "subscribe_key": SUB_KEY,
    "publish_key": PUB_KEY,
    "secret_key": SECRET_KEY,
    "uuid": UUID,
    "origin": origin
});


function pnTime() {
    pubnub.time(
        function (time) {
            displayCallback(time);
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
    // Use first and last args

    if (c && m) {
        console.log(JSON.stringify(c + ": " + m));
        $("#output").html(c + ":" + JSON.stringify(m, null, 4) + "\n\n" + $("#output").html());

        // Only one argument
    } else if (m) {
        console.log(JSON.stringify(m));
        $("#output").html(JSON.stringify(m, null, 4) + "\n\n" + $("#output").html());

    }
}

function pnSubscribe() {
    console.log('pnSubscribe');
    pubnub.subscribe({
        channel: channel,
        channel_group: channelGroup,
        callback: displayCallback,
        error: displayCallback,
        heartbeat: 15
    });
}

function pnHistory() {
    if (channel) {
        pubnub.history({
            channel: channel,
            callback: displayCallback,
            error: displayCallback,
            count: 5
        });
    } else if (channelGroup) {
        pubnub.history({
            channel_group: channelGroup,
            callback: displayCallback,
            error: displayCallback,
            count: 5
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
            channel_group: channelGroup,
            callback: displayCallback,
            error: displayCallback
        });
    }
}

function pnGetChannelGroups() {
    pubnub.channel_group({
        channel_group: channelGroup,
        callback: displayCallback,
        error: displayCallback
    });
}

function pnDeleteChannelGroups() {
    pubnub.channel_group_remove({
        callback: displayCallback,
        error: displayCallback,
        channel_group: channelGroup

    });
}

function pnGetChannelsForChannelGroup() {
    pubnub.channel_group({
        callback: displayCallback,
        error: displayCallback,
        channel_group: channelGroup
    });
}

function pnAddChannelToChannelGroup() {
    pubnub.channel_group({
        callback: displayCallback,
        error: displayCallback,
        channels: channel,
        channel_group: channelGroup
    });
}

function pnRemoveChannelFromChannelGroup() {
    pubnub.channel_group_remove({
        callback: displayCallback,
        error: displayCallback,
        channels: channel,
        channel_group: channelGroup
    });
}

function pnCloak(cloak) {
    pubnub.channel_group_cloak({
        channel_group: channelGroup,
        channel: channel,
        cloak: cloak,
        callback: displayCallback,
        error: displayCallback
    });
}

function pnSetState() {
    pubnub.state({
        channel_group: channelGroup,
        channel: channel,
        state: state,
        callback: displayCallback,
        error: displayCallback
    });
}

function pnGetState() {
    pubnub.state({
        channel_group: channelGroup,
        channel: channel,
        callback: displayCallback,
        error: displayCallback
    });
}

function pnGrant() {
    pubnub.grant({
        channel_group: channelGroup,
        channel: channel,
        read: $("#check_read").prop('checked'),
        write: $("#check_write").prop('checked'),
        manage: $("#check_manage").prop('checked'),
        callback: displayCallback,
        error: displayCallback
    });
}

function pnRevoke() {
    pubnub.revoke({
        channel_group: channelGroup,
        channel: channel,
        callback: displayCallback,
        error: displayCallback
    });
}

function pnAudit() {
    if (channel) {
        if (pamAuth) {
            pubnub.audit({
                channel: channel,
                callback: displayCallback,
                error: displayCallback,
                auth_key: pamAuth
            });
        } else {
            pubnub.audit({
                channel: channel,
                callback: displayCallback,
                error: displayCallback
            });
        }

    } else if (channelGroup) {
        if (pamAuth) {
            pubnub.audit({
                channel_group: channelGroup,
                callback: displayCallback,
                error: displayCallback,
                auth_key: pamAuth
            });
        } else {
            pubnub.audit({
                channel_group: channelGroup,
                callback: displayCallback,
                error: displayCallback
            });
        }
    } else { // SubKey Level
        if (pamAuth) {
            pubnub.audit({
                callback: displayCallback,
                error: displayCallback,
                auth_key: pamAuth
            });
        } else {
            pubnub.audit({
                channel_group: channelGroup,
                callback: displayCallback,
                error: displayCallback
            });
        }
    }
}

function pnHereNow() {
    if (channel) {
        pubnub.here_now({
            channel: channel,
            callback: displayCallback,
            error: displayCallback
        });
    } else if (!channelGroup) {
        pubnub.here_now({
            callback: displayCallback,
            error: displayCallback
        });
    } else if (channelGroup) {
        pubnub.here_now({
            channel_group: channelGroup,
            callback: displayCallback,
            error: displayCallback
        });
    }
}

function pnWhereNow() {
    if (channel) {
        pubnub.where_now({
            channel: channel,
            callback: displayCallback,
            error: displayCallback
        });

    } else if (channelGroup) {
        pubnub.where_now({
            channel_group: channelGroup,
            callback: displayCallback,
            error: displayCallback
        });
    }
}

pubnub.auth(auth);

$("#whereNow").click(function () {
    pnWhereNow();
});

$("#hereNow").click(function () {
    pnHereNow();
});

$("#getState").click(function () {
    pnGetState();
});

$("#setState").click(function () {
    pnSetState();
});

$("#history").click(function () {
    pnHistory();
});

$("#removeChannelFromChannelGroup").click(function () {
    pnRemoveChannelFromChannelGroup();
});

$("#addChannelToChannelGroup").click(function () {
    pnAddChannelToChannelGroup();
});

$("#getChannelsForChannelGroup").click(function () {
    pnGetChannelsForChannelGroup();
});

$("#removeChannelGroup").click(function () {
    pnDeleteChannelGroups();
});

$("#getAllChannelGroups").click(function () {
    pnGetChannelGroups();
});

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

$("#grant").click(function () {
    pnGrant();
});

$("#revoke").click(function () {
    pnRevoke();
});

$("#audit").click(function () {
    pnAudit();
});

$("#setCloak").click(function () {
    pnCloak(true);
});
$("#unsetCloak").click(function () {
    pnCloak(false);
});

$(".clear").click(function () {
    $("#output").html("");
});