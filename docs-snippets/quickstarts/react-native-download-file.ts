import type PubNub from 'pubnub';

/**
 * Example for downloading a file in React and React Native. The example assumes a client named `pubnub`, so it sits in
 * a function that receives it.
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
