import PubNub from '../../lib/types';
import fs from 'fs';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.encryptMessageBasicUsage
// Create a crypto module instance with AES-CBC encryption
const cryptoModule = PubNub.CryptoModule.aesCbcCryptoModule({
  cipherKey: 'pubnubenigma',
});

const msgContent = 'This is the data I wish to encrypt.';
console.log(`Original Message: ${msgContent}`);

// Encrypt the message
const encryptedMessage = cryptoModule.encrypt(JSON.stringify(msgContent));
console.log('message encrypted successfully');
// snippet.end

// snippet.encryptFileBasicUsage
// Node.js example
// import fs from 'fs';

const fileBuffer = fs.readFileSync('./cat_picture.jpg');

const file = pubnub.File.create({ data: fileBuffer, name: 'cat_picture.jpg', mimeType: 'image/jpeg' });

const encryptedFile = await pubnub.encryptFile(file);
// snippet.end

const encrypted = '..';
// snippet.decryptBasicUsage
const decrypted = pubnub.decrypt(encrypted); // Pass the encrypted data as the first parameter in decrypt Method
// snippet.end

// snippet.decryptFileBasicUsage
const fileBufferData = fs.readFileSync('./cat_picture_encrypted.jpg');

const fileData = pubnub.File.create({ data: fileBuffer, name: 'cat_picture.jpg', mimeType: 'image/jpeg' });

const decryptedFile = await pubnub.decryptFile(fileData);
// snippet.end

// snippet.setProxyBasicUsage
pubnub.setProxy({
  hostname: 'YOUR_HOSTNAME',
  port: 8080,
  protocol: 'YOUR_PROTOCOL',
});
// snippet.end
