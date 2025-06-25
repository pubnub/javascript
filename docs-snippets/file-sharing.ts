import PubNub from '../lib/types';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.sendFileCustomCipherKey
// in Node.js
import fs from 'fs';

try {
  const myFile = fs.readFileSync('./cat_picture.jpg');

  const response = await pubnub.sendFile({
    channel: 'my_channel',
    message: 'Look at this picture!',
    file: { data: myFile, name: 'cat_picture.jpg', mimeType: 'application/json' },
    cipherKey: 'myCipherKey',
  });
  console.log(`File sent successfully: ${response}`);
} catch (error) {
  console.error('Error sending file:', error);
}
// snippet.end

// snippet.downloadFileCustomCipherKey
const file = await pubnub.downloadFile({
  channel: 'my_channel',
  id: '...',
  name: 'cat_picture.jpg',
  cipherKey: 'myCipherKey',
});
// snippet.end
