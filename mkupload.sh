#!/bin/bash

VERSION=`cat VERSION`

mkdir -p upload
rm upload/*

cp web/pubnub.js upload/pubnub.js
cp web/pubnub.min.js upload/pubnub.min.js
cp socket.io/socket.io.min.js upload/socket.io.min.js

cp upload/pubnub.js upload/pubnub-$VERSION.js
cp upload/pubnub.min.js upload/pubnub-$VERSION.min.js

gzip -9 upload/*

mv upload/pubnub.js.gz upload/pubnub.js
mv upload/pubnub.min.js.gz upload/pubnub.min.js
mv upload/socket.io.min.js.gz upload/socket.io.min.js

mv upload/pubnub-$VERSION.js.gz upload/pubnub-$VERSION.js
mv upload/pubnub-$VERSION.min.js.gz upload/pubnub-$VERSION.min.js

