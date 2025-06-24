import PubNub, { PubNubError } from '../../lib/types';
import fs from 'fs';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.sendFileBasicUsage
// Function to send a file to a channel
try {
  const myFile = fs.createReadStream('./cat_picture.jpg');

  const response = await pubnub.sendFile({
    channel: 'my_channel',
    file: { stream: myFile, name: 'cat_picture.jpg', mimeType: 'image/jpeg' },
    customMessageType: 'file-message',
  });

  console.log('File sent successfully:', response);
} catch (error) {
  console.error(
    `Error sending file: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.listFilesBasicUsage
try {
  const response = await pubnub.listFiles({ channel: 'my_channel' });
  console.log('Files listed successfully:', response);
} catch (error) {
  console.error(
    `Error listing files: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.getFileUrlBasicUsage
const response = pubnub.getFileUrl({ channel: 'my_channel', id: '...', name: '...' });
// snippet.end

// snippet.downloadFileNodeBasicUsage
// In Node.js using streams:
// import fs from 'fs'
try {
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
} catch (error) {
  console.error(
    `Error downloading file: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.downloadFileReactNativeBasicUsage
// in React and React Native
let file;
try {
  file = await pubnub.downloadFile({
    channel: 'awesomeChannel',
    id: 'imageId',
    name: 'cat_picture.jpg',
  });
} catch (error) {
  console.error(
    `Error downloading file: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
let fileContent = await file!.toBlob();
// snippet.end

// snippet.deleteFileBasicUsage
try {
  const deleteFileResponse = await pubnub.deleteFile({
    channel: 'my_channel',
    id: '...',
    name: 'cat_picture.jpg',
  });
  console.log('File deleted successfully:', deleteFileResponse);
} catch (error) {
  console.error(
    `Error deleting file: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end

// snippet.publishFileMessageBasicUsage
try {
  const fileMessageResponse = await pubnub.publishFile({
    channel: 'my_channel',
    fileId: '...',
    fileName: 'cat_picture.jpg',
    message: { field: 'value' },
    customMessageType: 'file-message',
  });
  console.log('File message published successfully:', fileMessageResponse);
} catch (error) {
  console.error(
    `Error publishing file message: ${error}.${
      (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
    }`,
  );
}
// snippet.end
