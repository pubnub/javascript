import PubNub from '../../lib/types';
import fs from 'fs';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.sendFileBasicUsage
// Function to send a file to a channel
async function sendFileToChannel() {
  try {
    const myFile = fs.createReadStream('./cat_picture.jpg');

    const response = await pubnub.sendFile({
      channel: 'my_channel',
      file: { stream: myFile, name: 'cat_picture.jpg', mimeType: 'image/jpeg' },
      customMessageType: 'file-message',
    });

    console.log(`File sent successfully: ${response}`);
  } catch (error) {
    console.log(`Error sending file: ${error}`);
  }
}

// Execute the function to send the file
sendFileToChannel();
// snippet.end

// snippet.listFilesBasicUsage
try {
  const response = await pubnub.listFiles({ channel: 'my_channel' });
  console.log(`Files listed successfully: ${response}`);
} catch (error) {
  console.log(`Error listing files: ${error}`);
}
// snippet.end

// snippet.getFileUrlBasicUsage
const response = pubnub.getFileUrl({ channel: 'my_channel', id: '...', name: '...' });
// snippet.end

// snippet.downloadFileNodeBasicUsage
// In Node.js using streams:
// import fs from 'fs'

const downloadFileResponse = await pubnub.downloadFile({
  channel: 'my_channel',
  id: '...',
  name: 'cat_picture.jpg',
});

const output = fs.createWriteStream('./cat_picture.jpg');
const fileStream = await downloadFileResponse.toStream();

fileStream.pipe(output);

output.once('end', () => {
  console.log('File saved to ./cat_picture.jpg');
});
// snippet.end

// snippet.downloadFileReactNativeBasicUsage
// in React and React Native
const file = await pubnub.downloadFile({
  channel: 'awesomeChannel',
  id: 'imageId',
  name: 'cat_picture.jpg'
});

let fileContent = await file.toBlob();
// snippet.end

// snippet.deleteFileBasicUsage
const deleteFileResponse = await pubnub.deleteFile({
  channel: "my_channel",
  id: "...",
  name: "cat_picture.jpg",
});
// snippet.end

// snippet.publishFileMessageBasicUsage
const fileMessageResponse = await pubnub.publishFile({
  channel: "my_channel",
  fileId: "...",
  fileName: "cat_picture.jpg",
  message: { field: "value" },
  customMessageType: 'file-message',
});
// snippet.end