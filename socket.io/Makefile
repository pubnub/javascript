include ../Makefile.inc

WEB_DIR=$(REPOS_DIR)/web

PUBNUB_MIN_JS=$(WEB_DIR)/pubnub.min.js
SOCKET_IO_BASE_JS=socket.io-base.js
SOCKET_IO_MIN_JS=socket.io.min.js
OUTPUT_FILES=$(SOCKET_IO_MIN_JS)
SOCKET_IO_TMP=socket.io.tmp

GIBBERISH_AES_JS=$(CRYPTO_DIR)/gibberish-aes.js
ENCRYPT_PUBNUB_JS=$(CRYPTO_DIR)/encrypt-pubnub.js

.PHONY	: all
all: build

.PHONY	: build
build: $(SOCKET_IO_MIN_JS)



$(SOCKET_IO_MIN_JS): $(SOCKET_IO_BASE_JS) $(PUBNUB_MIN_JS)
	cat $(SOCKET_IO_BASE_JS) | java -jar $(GOOGLE_MINIFY) > $(SOCKET_IO_TMP)
	cat $(PUBNUB_MIN_JS) $(GIBBERISH_AES_JS) $(ENCRYPT_PUBNUB_JS) $(SOCKET_IO_TMP) > $(SOCKET_IO_MIN_JS) 
	rm $(SOCKET_IO_TMP)

.PHONY	: clean
clean:
	rm -f $(OUTPUT_FILES) $(SOCKET_IO_TMP)

include ../Makefile.post
