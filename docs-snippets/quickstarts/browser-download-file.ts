import type PubNub from 'pubnub';

/**
 * Browser example for downloading a file. The example assumes a client named `pubnub`, declared below.
 */
declare const pubnub: PubNub;

// snippet.downloadFileWebBasicUsage
// In browser
// download the intended file
const downloadFile = async () => {
  const file = await pubnub.downloadFile({
    channel: 'my_channel',
    id: '...',
    name: 'cat_picture.jpg',
  });

  // have proper html element to display the file
  const myImageTag = document.createElement('img');
  // snippet.hide
  // @ts-expect-error
  // snippet.show
  myImageTag.src = URL.createObjectURL(await file!.toFile());

  // attach the file content to the html element
  document.body.appendChild(myImageTag);
};
// snippet.end

export { downloadFile };
