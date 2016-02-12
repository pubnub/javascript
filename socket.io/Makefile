include ../Makefile.inc

WEB_DIR=$(REPOS_DIR)/web/$(PUBNUB_DIST_DIR)

PUBNUB_JS=$(WEB_DIR)/pubnub.js
SOCKET_IO_BASE_JS=$(PUBNUB_UNASSEMBLED_DIR)/socket.io-base.js
SOCKET_IO_MIN_JS=$(PUBNUB_DIST_DIR)/socket.io.min.js
SOCKET_IO_TMP=socket.io.tmp

.PHONY	: all
all: build

.PHONY	: build
build: $(SOCKET_IO_MIN_JS)

$(SOCKET_IO_MIN_JS): $(SOCKET_IO_BASE_JS) $(PUBNUB_JS)
	echo "\n\n SOCKET.IO \n\n" 
	mkdir $(PUBNUB_DIST_DIR)

	$(ECHO) "// Version: $(VERSION)" > $(SOCKET_IO_MIN_JS)
	$(ECHO) "(function(){" >> $(SOCKET_IO_MIN_JS)
	cat $(PUBNUB_JS)  | ../node_modules/.bin/uglifyjs -c -m >> $(SOCKET_IO_MIN_JS)
	$(ECHO) "})();" >> $(SOCKET_IO_MIN_JS)
	cat $(SOCKET_IO_BASE_JS)  | ../node_modules/.bin/uglifyjs -c -m > $(SOCKET_IO_TMP)
	cat $(SOCKET_IO_TMP) >> $(SOCKET_IO_MIN_JS) 
	rm $(SOCKET_IO_TMP)

.PHONY	: clean
clean:
	rm -f $(SOCKET_IO_TMP)
	rm -rf $(PUBNUB_DIST_DIR)

include ../Makefile.post
