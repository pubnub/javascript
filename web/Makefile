include ../Makefile.inc
PLATFORM=Web

.PHONY	: all
all: build

.PHONY	: build
build: $(PUBNUB_VERSION_MIN_JS)

$(PUBNUB_VERSION_MIN_JS) : $(JSON_JS) $(PUBNUB_COMMON_JS) $(WEBSOCKET_JS) $(PUBNUB_PLATFORM_JS)
	echo "\n\n $(PLATFORM) \n\n" 
	mkdir $(PUBNUB_DIST_DIR)

	## Full Version
	$(ECHO) "// Version: $(VERSION) / $(PLATFORM)" > $(PUBNUB_VERSION_JS)
	cat $(JSON_JS) $(PUBNUB_PLATFORM_PRE_JS) $(PUBNUB_COMMON_JS) $(CRYPTO_OBJ_JS) $(PUBNUB_PLATFORM_JS) $(PUBNUB_PLATFORM_POST_JS) $(WEBSOCKET_JS) >> $(PUBNUB_VERSION_JS)
	sed -i -e "s/VERSION/\'$(VERSION)\'/g" $(PUBNUB_VERSION_JS)
	sed -i -e "s/PLATFORM/\'$(PLATFORM)\'/g" $(PUBNUB_VERSION_JS)
	## Minfied Version
	$(ECHO) "// Version: $(VERSION) / $(PLATFORM)" > $(PUBNUB_VERSION_MIN_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_VERSION_MIN_JS)
	cat $(PUBNUB_VERSION_JS) | ../node_modules/.bin/uglifyjs -c -m >> $(PUBNUB_VERSION_MIN_JS)
	$(ECHO) "})();" >> $(PUBNUB_VERSION_MIN_JS)
	cat $(CRYPTOJS_HMAC_SHA256_JS) >> $(PUBNUB_VERSION_JS)
	cat $(CRYPTOJS_HMAC_SHA256_JS) >> $(PUBNUB_VERSION_MIN_JS)
	cp $(PUBNUB_VERSION_MIN_JS) $(PUBNUB_MIN_JS)
	cp $(PUBNUB_VERSION_JS) $(PUBNUB_JS)
	cp $(PUBNUB_MIN_JS) ../smart-tv/
	cp $(PUBNUB_JS) ../smart-tv/

	cp $(PUBNUB_MIN_JS) ../web/
	cp $(PUBNUB_JS) ../web/

.PHONY	: clean
clean:
	rm -rf $(PUBNUB_DIST_DIR)
	rm -rf pubnub.js
	rm -rf pubnub.min.js

include ../Makefile.post
