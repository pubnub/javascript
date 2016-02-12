include ../Makefile.inc
PLATFORM=Webos
MODERN_PLATFORM_JS=../modern/$(PUBNUB_PLATFORM_JS)
MODERN_PLATFORM_PRE_JS=../modern/$(PUBNUB_PLATFORM_PRE_JS)
MODERN_PLATFORM_POST_JS=../modern/$(PUBNUB_PLATFORM_POST_JS)

.PHONY	: all
all: build

.PHONY	: build
build: $(PUBNUB_MIN_JS)

$(PUBNUB_MIN_JS) : $(PUBNUB_COMMON_JS) $(WEBSOCKET_JS) $(MODERN_PLATFORM_JS)
	echo "\n\n $(PLATFORM) \n\n" 
	mkdir $(PUBNUB_DIST_DIR)

	## Full Version
	$(ECHO)  "// Version: $(VERSION)" > $(PUBNUB_JS)
	cat $(MODERN_PLATFORM_PRE_JS) $(PUBNUB_COMMON_JS) $(CRYPTO_OBJ_JS) $(MODERN_PLATFORM_JS) $(MODERN_PLATFORM_POST_JS) $(WEBSOCKET_JS) >> $(PUBNUB_JS)
	sed -i -e "s/VERSION/\'$(VERSION)\'/g" $(PUBNUB_JS)
	sed -i -e "s/PLATFORM/\'$(PLATFORM)\'/g" $(PUBNUB_JS)
	## Minfied Version
	$(ECHO)  "// Version: $(VERSION)" > $(PUBNUB_MIN_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_MIN_JS)
	cat $(CRYPTOJS_HMAC_SHA256_JS) >> $(PUBNUB_MIN_JS)
	cat $(PUBNUB_JS) | ../node_modules/.bin/uglifyjs -c -m >> $(PUBNUB_MIN_JS)
	$(ECHO) "})();" >> $(PUBNUB_MIN_JS)

.PHONY	: clean
clean:
	rm -rf $(PUBNUB_DIST_DIR)

include ../Makefile.post
