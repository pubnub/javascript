import { PubNubError } from 'lib/types';
import PubNub from '../../src/web/index';

const pubnub = new PubNub({
  publishKey: 'demo',
  subscribeKey: 'demo',
  userId: 'myUniqueUserId',
});

// snippet.downloadFileWebBasicUsage
// In browser
// download the intended file
const downloadFile = async () => {
  try {
    const file = await pubnub.downloadFile({
      channel: 'my_channel',
      id: '...',
      name: 'cat_picture.jpg',
    });

    // have proper html element to display the file
    const myImageTag = document.createElement('img');
    myImageTag.src = URL.createObjectURL(await file!.toFile());

    // attach the file content to the html element
    document.body.appendChild(myImageTag);
  } catch (error) {
    console.error(
      `Download file error: ${error}.${
        (error as PubNubError).status ? ` Additional information: ${(error as PubNubError).status}` : ''
      }`,
    );
  }
};
// snippet.end
