import type PubNub from 'pubnub';

/**
 * docs/sdks/javascript/api-reference/file-sharing.md, "Download file", the React and React Native sample.
 *
 * Not compiled and not run here, because the SDK has no React Native dependencies and this repository has no browser. The
 * page shows loose statements that use a client named `pubnub`, so they sit in a function that receives it. Only the lines
 * between the markers are on the page.
 */
export async function downloadFileSample(pubnub: PubNub): Promise<ArrayBuffer> {
  // snippet.downloadFileReactNativeBasicUsage
  // in React and React Native
  const file = await pubnub.downloadFile({
    channel: 'awesomeChannel',
    id: 'imageId',
    name: 'cat_picture.jpg',
  });

  // toArrayBuffer() works in React and React Native (toBlob() is not supported in React Native)
  const fileContent = await file.toArrayBuffer();
  // snippet.end
  return fileContent;
}
