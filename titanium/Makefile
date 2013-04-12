include ../Makefile.inc
OUTPUT_FILES=$(PUBNUB_JS) $(PUBNUB_CRYPTO_JS)
EXAMPLE_RESOURCES=$(shell for file in `find examples -name "pubnub.js" | grep -v build`;do echo $$file; done)
PLATFORM=Titanium

.PHONY	: all
all: build 

.PHONY	: build
build: $(PUBNUB_JS)

$(PUBNUB_JS) : $(JSON_JS) $(PUBNUB_COMMON_JS) $(PUBNUB_PLATFORM_JS)
	$(ECHO) -n "// " > $(PUBNUB_JS)
	$(ECHO) $(VERSION) >> $(PUBNUB_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_JS)
	cat $(PUBNUB_COMMON_JS) $(PUBNUB_PLATFORM_JS) >> $(PUBNUB_JS)
	sed -i -e "s/VERSION/\'$(VERSION)\'/g" $(PUBNUB_JS)
	sed -i -e "s/PLATFORM/\'$(PLATFORM)\'/g" $(PUBNUB_JS)
	$(ECHO) "})();" >> $(PUBNUB_JS)
	for f in $(EXAMPLE_RESOURCES); do cp $(PUBNUB_JS) $$f ; done

$(PUBNUB_CRYPTO_JS) : $(GIBBERISH_JS) $(ENCRYPT_JS)
	$(ECHO) "(function(){" >> $(PUBNUB_CRYPTO_JS)
	cat $(GIBBERISH_JS) $(ENCRYPT_JS)  >> $(PUBNUB_CRYPTO_JS)
	$(ECHO) "})();" >> $(PUBNUB_CRYPTO_MIN_JS)


.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES)

include ../Makefile.post
