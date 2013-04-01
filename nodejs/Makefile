include ../Makefile.inc


OUTPUT_FILES=$(PUBNUB_JS)




.PHONY	: all
all: build

.PHONY	: build
build: $(PUBNUB_JS)



$(PUBNUB_JS): $(PUBNUB_COMMON_JS) $(PUBNUB_NODE_JS)
	cat $(PUBNUB_COMMON_JS) $(PUBNUB_PLATFORM_JS) > $(PUBNUB_JS)

.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES) 

.PHONY	: test
test:
	mocha -R spec tests/test.js
