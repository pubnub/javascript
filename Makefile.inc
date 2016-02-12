# functions
ECHO=/bin/echo
VERSION=$(shell cat $(REPOS_DIR)/VERSION)

# folders
REPOS_DIR=..
TOOLS_DIR=$(REPOS_DIR)/tools
CRYPTO_DIR=$(CORE_DIR)/crypto
PUBNUB_UNASSEMBLED_DIR=unassembled
PUBNUB_DIST_DIR=dist
CORE_DIR=$(REPOS_DIR)/core

## imports
CRYPTO_OBJ_JS=$(CORE_DIR)/crypto/crypto-obj.js
GIBBERISH_JS=$(CORE_DIR)/crypto/gibberish-aes.js
WEBSOCKET_JS=$(CORE_DIR)/websocket.js
ENCRYPT_JS=$(CORE_DIR)/crypto/encrypt-pubnub.js

## deps
PACKAGE_JSON=$(REPOS_DIR)/package.json
PUBNUB_PLATFORM_JS=$(PUBNUB_UNASSEMBLED_DIR)/platform.js
PUBNUB_PLATFORM_PRE_JS=$(PUBNUB_UNASSEMBLED_DIR)/platform-pre.js
PUBNUB_PLATFORM_POST_JS=$(PUBNUB_UNASSEMBLED_DIR)/platform-post.js
PUBNUB_COMMON_JS=$(CORE_DIR)/pubnub-common.js

## vendors
CRYPTOJS_HMAC_SHA256_JS=$(CORE_DIR)/external_js/hmac-sha256.js
JSON_JS=$(CORE_DIR)/json.js

## outputs
PUBNUB_JS=$(PUBNUB_DIST_DIR)/pubnub.js
PUBNUB_MIN_JS=$(PUBNUB_DIST_DIR)/pubnub.min.js
PUBNUB_VERSION_JS=$(PUBNUB_DIST_DIR)/pubnub-$(VERSION).js
PUBNUB_VERSION_MIN_JS=$(PUBNUB_DIST_DIR)/pubnub-$(VERSION).min.js
