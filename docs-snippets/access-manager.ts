import PubNub from '../lib/types';

// Initialize PubNub with demo keys
const pubnub = new PubNub({
    publishKey: 'demo',
    subscribeKey: 'demo',
    userId: 'myUniqueUserId'
  });

// snippet.grantTokenVariousResources   
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorized_uuid: "my-authorized-uuid",
        resources: {
            channels: {
                "channel-a": {
                    read: true,
                },
                "channel-b": {
                    read: true,
                    write: true,
                },
                "channel-c": {
                    read: true,
                    write: true,
                },
                "channel-d": {
                    read: true,
                    write: true,
                },
            },
            groups: {
                "channel-group-b": {
                    read: true,
                },
            },
            uuids: {
                "uuid-c": {
                    get: true,
                },
                "uuid-d": {
                    get: true,
                    update: true,
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.grantTokenUsingRegEx
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorized_uuid: "my-authorized-uuid",
        patterns: {
            channels: {
                "^channel-[A-Za-z0-9]$": {
                    read: true,
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.grantTokenRegExAndResources
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorized_uuid: "my-authorized-uuid",
        resources: {
            channels: {
                "channel-a": {
                    read: true,
                },
                "channel-b": {
                    read: true,
                    write: true,
                },
                "channel-c": {
                    read: true,
                    write: true,
                },
                "channel-d": {
                    read: true,
                    write: true,
                },
            },
            groups: {
                "channel-group-b": {
                    read: true,
                },
            },
            uuids: {
                "uuid-c": {
                    get: true,
                },
                "uuid-d": {
                    get: true,
                    update: true,
                },
            },
        },
        patterns: {
            channels: {
                "^channel-[A-Za-z0-9]$": {
                    read: true
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.grantTokenSpaceUserResources
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorizedUserId: "my-authorized-userId",
        resources: {
            spaces: {
                "space-a": {
                    read: true,
                },
                "space-b": {
                    read: true,
                    write: true,
                },
                "space-c": {
                    read: true,
                    write: true,
                },
                "space-d": {
                    read: true,
                    write: true,
                },
            },
            users: {
                "userId-c": {
                    get: true,
                },
                "userId-d": {
                    get: true,
                    update: true,
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

// snippet.grantTokenSpaceUserRegEx
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorizedUserId: "my-authorized-userId",
        patterns: {
            spaces: {
                "^space-[A-Za-z0-9]$": {
                    read: true,
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end


// snippet.grantTokenSpacesUserRegExResources
try {
    const token = await pubnub.grantToken({
        ttl: 15,
        authorizedUserId: "my-authorized-userId",
        resources: {
            spaces: {
                "space-a": {
                    read: true,
                },
                "space-b": {
                    read: true,
                    write: true,
                },
                "space-c": {
                    read: true,
                    write: true,
                },
                "space-d": {
                    read: true,
                    write: true,
                },
            },
            users: {
                "userId-c": {
                    get: true,
                },
                "userId-d": {
                    get: true,
                    update: true,
                },
            },
        },
        patterns: {
            spaces: {
                "^space-[A-Za-z0-9]$": {
                    read: true
                },
            },
        },
    });
} catch (status) {
    console.log(status);
}
// snippet.end

