include ../Makefile.inc
OUTPUT_FILES=$(PUBNUB_MIN_JS)
PLATFORM=Sencha
MODERN_PLATFORM_JS=../modern/$(PUBNUB_PLATFORM_JS)
MODERN_PLATFORM_PRE_JS=../modern/$(PUBNUB_PLATFORM_PRE_JS)

.PHONY	: all
all: build

.PHONY	: build
build: $(PUBNUB_MIN_JS)

$(PUBNUB_MIN_JS) : $(PUBNUB_COMMON_JS) $(WEBSOCKET_JS) $(MODERN_PLATFORM_JS)
	## Full Version
	$(ECHO)  "// Version: $(VERSION)" > $(PUBNUB_JS)
	cat $(MODERN_PLATFORM_PRE_JS) $(PUBNUB_COMMON_JS) $(CRYPTO_OBJ_JS) $(MODERN_PLATFORM_JS) $(WEBSOCKET_JS) >> $(PUBNUB_JS)
	sed -i -e "s/VERSION/\'$(VERSION)\'/g" $(PUBNUB_JS)
	sed -i -e "s/PLATFORM/\'$(PLATFORM)\'/g" $(PUBNUB_JS)
	## Minfied Version
	$(ECHO)  "// Version: $(VERSION)" > $(PUBNUB_MIN_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_MIN_JS)
	cat $(CRYPTOJS_HMAC_SHA256_JS) $(CRYPTOJS_ENC_BASE64_JS) >> $(PUBNUB_MIN_JS)
	cat $(PUBNUB_JS) | java -jar $(GOOGLE_MINIFY) --compilation_level=ADVANCED_OPTIMIZATIONS >> $(PUBNUB_MIN_JS)
	$(ECHO) "})();" >> $(PUBNUB_MIN_JS)

.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES)

include ../Makefile.post
