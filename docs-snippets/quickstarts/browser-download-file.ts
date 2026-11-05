import type PubNub from 'pubnub';

/**
 * docs/sdks/javascript/api-reference/file-sharing.md, "Download file", the browser sample.
 *
 * Type checked here by tsconfig.browser.json. It cannot be run in this repository, which has no browser. The page assumes a
 * client named `pubnub`, declared below.
 * The hidden `@ts-expect-error` records an SDK typing bug: the shipped types declare `toFile(): Promise<void>`.
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
  // @ts-expect-error the shipped types declare toFile(): Promise<void>, the browser returns a File (SDK bug, STATUS.md)
  // snippet.show
  myImageTag.src = URL.createObjectURL(await file!.toFile());

  // attach the file content to the html element
  document.body.appendChild(myImageTag);
};
// snippet.end

export { downloadFile };
