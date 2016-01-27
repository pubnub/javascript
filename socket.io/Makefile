include ../Makefile.inc

WEB_DIR=$(REPOS_DIR)/web

PUBNUB_JS=$(WEB_DIR)/pubnub.js
SOCKET_IO_BASE_JS=socket.io-base.js
SOCKET_IO_MIN_JS=socket.io.min.js
OUTPUT_FILES=$(SOCKET_IO_MIN_JS)
SOCKET_IO_TMP=socket.io.tmp

.PHONY	: all
all: build

.PHONY	: build
build: $(SOCKET_IO_MIN_JS)

$(SOCKET_IO_MIN_JS): $(SOCKET_IO_BASE_JS) $(PUBNUB_JS)
	$(ECHO) "// Version: $(VERSION)" > $(SOCKET_IO_MIN_JS)
	$(ECHO) "(function(){" >> $(SOCKET_IO_MIN_JS)
	cat $(PUBNUB_JS)  | ../node_modules/.bin/uglifyjs -c >> $(SOCKET_IO_MIN_JS)
	$(ECHO) "})();" >> $(SOCKET_IO_MIN_JS)
	cat $(SOCKET_IO_BASE_JS)  | ../node_modules/.bin/uglifyjs -c > $(SOCKET_IO_TMP)
	cat $(SOCKET_IO_TMP) >> $(SOCKET_IO_MIN_JS) 
	rm $(SOCKET_IO_TMP)

.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES) $(SOCKET_IO_TMP)

include ../Makefile.post
