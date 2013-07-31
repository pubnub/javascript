include ../Makefile.inc
OUTPUT_FILES=$(PUBNUB_MIN_JS) $(PUBNUB_CRYPTO_MIN_JS)
PLATFORM=Web

.PHONY	: all
all: build

.PHONY	: build
build: $(PUBNUB_MIN_JS) $(PUBNUB_CRYPTO_MIN_JS)

$(PUBNUB_MIN_JS) : $(JSON_JS) $(PUBNUB_COMMON_JS) $(WEBSOCKET_JS) $(PUBNUB_PLATFORM_JS)
	## Full Version
	$(ECHO) "// Version: $(VERSION)" > $(PUBNUB_JS)
	cat $(JSON_JS) $(PUBNUB_COMMON_JS) $(PUBNUB_PLATFORM_JS) $(WEBSOCKET_JS) >> $(PUBNUB_JS)
	sed -i -e "s/VERSION/\'$(VERSION)\'/g" $(PUBNUB_JS)
	sed -i -e "s/PLATFORM/\'$(PLATFORM)\'/g" $(PUBNUB_JS)
	## Minfied Version
	$(ECHO) "// Version: $(VERSION)" > $(PUBNUB_MIN_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_MIN_JS)
	cat $(PUBNUB_JS) | java -jar $(GOOGLE_MINIFY) --compilation_level=ADVANCED_OPTIMIZATIONS >> $(PUBNUB_MIN_JS)
	$(ECHO) "})();" >> $(PUBNUB_MIN_JS)

$(PUBNUB_CRYPTO_MIN_JS) : $(GIBBERISH_JS) $(ENCRYPTO_JS)
	## Cryptography
	cat ./external_js/hmac-sha256.js > $(PUBNUB_CRYPTO_MIN_JS)
	cat ./external_js/enc-base64-min.js >> $(PUBNUB_CRYPTO_MIN_JS) 
	$(ECHO) "(function(){" >> $(PUBNUB_CRYPTO_MIN_JS)
	cat $(GIBBERISH_JS) $(ENCRYPT_JS) | java -jar $(GOOGLE_MINIFY) >> $(PUBNUB_CRYPTO_MIN_JS)
	$(ECHO) "})();" >> $(PUBNUB_CRYPTO_MIN_JS)

.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES)

include ../Makefile.post
