function crypto_obj() {

    function SHA256(s) {
        return CryptoJS['SHA256'](s)['toString'](CryptoJS['enc']['Hex']);
    }

    return {

        'encrypt': function(data, key) {
            if (!key) return data;
            var iv = CryptoJS['enc']['Utf8']['parse']('0123456789012345');
            var cipher_key = CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
            var hex_message = JSON['stringify'](data);
            var encryptedHexArray = CryptoJS['AES']['encrypt'](hex_message, cipher_key, {'iv': iv})['ciphertext'];
            var base_64_encrypted = encryptedHexArray['toString'](CryptoJS['enc']['Base64']);
            return base_64_encrypted || data;
        },

        'decrypt': function(data, key) {
            if (!key) return data;
            var iv = CryptoJS['enc']['Utf8']['parse']('0123456789012345');
            var cipher_key = CryptoJS['enc']['Utf8']['parse'](SHA256(key)['slice'](0, 32));
            try {
                var binary_enc = CryptoJS['enc']['Base64']['parse'](data);
                var json_plain = CryptoJS['AES']['decrypt']({'ciphertext': binary_enc}, cipher_key, {'iv': iv})['toString'](CryptoJS['enc']['Utf8']);
                var plaintext = JSON['parse'](json_plain);
                return plaintext;
            }
            catch (e) {
                return undefined;
            }
        }
    };
}
