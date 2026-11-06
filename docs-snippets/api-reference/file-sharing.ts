import assert from '../harness/assert.js';
import { Readable } from 'node:stream';
import { page, step, check } from '../harness/step.js';
import { eventually, watch } from '../harness/wait.js';
import { explainError } from '../harness/guard.js';
import { enterWorkdir, FIXTURE_FILE } from '../fixtures/workdir.js';

import fs from 'fs';

/**
 * File sharing examples for Node.js.
 */
export default page('api-reference/file-sharing', 'P4', (world) => {
  // Plain bytes of the fixture, the reference every download is compared against.
  const original = fs.readFileSync(FIXTURE_FILE);
  let uploaded: { id: string; name: string } | undefined;
  const uploadedFile = (): { id: string; name: string } => {
    assert.ok(uploaded, 'sendFileBasicUsage has not run');
    world.setPh('fileId', uploaded.id);
    return uploaded;
  };

  check('preflightFiles', { phase: 'P0', timeout: 60_000, proves: 'Preflight: the open keyset has Files enabled, checked by uploading and deleting a tiny file.' }, async () => {
    const channel = world.n('preflight_channel');
    try {
      const sent = await world.friend.sendFile({ channel, file: { data: Buffer.from('preflight'), name: 'preflight.txt', mimeType: 'text/plain' } });
      await world.friend.deleteFile({ channel, id: sent.id, name: 'preflight.txt' });
    } catch (error) {
      explainError(error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`The open keyset cannot send files. Enable "File Sharing" (and Message Persistence) for it. ${detail}`);
    }
  });

  step('sendFileBasicUsage', { needs: ['preflightFiles'], timeout: 60_000, proves: 'sendFile uploads the picture and a second client receives the file event.' }, async () => {
    const pubnub = world.shopper;
    const listening = await watch(world.fresh('fileobserver'), [world.n('my_channel')]);
    const workdir = enterWorkdir();
    try {
      // snippet.sendFileBasicUsage
      // Function to send a file to a channel
      // in node.js, make sure to import 'fs'
      // and use the createReadStream method to read the file
      const myFile = fs.createReadStream('./cat_picture.jpg');

      const response = await pubnub.sendFile({
        channel: 'my_channel',
        file: { stream: myFile, name: 'cat_picture.jpg', mimeType: 'image/jpeg' },
        customMessageType: 'file-message',
      });

      console.log('File sent successfully:', response);
      // snippet.end
      assert.ok(response.id, 'the response carries the file id');
      assert.equal(response.name, 'cat_picture.jpg');
      uploaded = { id: response.id, name: response.name };
      const event = await listening.next('file', (e) => e.file?.id === response.id);
      assert.equal(event.channel, world.n('my_channel'));
      assert.equal(event.file?.name, 'cat_picture.jpg');
      assert.equal(event.publisher, pubnub.getUserId());
    } finally {
      listening.stop();
      workdir.restore();
    }
  });

  step('listFilesBasicUsage', { needs: ['sendFileBasicUsage'], proves: 'listFiles returns the file the send step uploaded.' }, async () => {
    const pubnub = world.shopper;
    const { id } = uploadedFile();
    // snippet.listFilesBasicUsage
    const response = await pubnub.listFiles({ channel: 'my_channel' });
    console.log('Files listed successfully:', response);
    // snippet.end
    const entry = response.data.find((f) => f.id === id);
    assert.ok(entry, 'the uploaded file is listed');
    assert.equal(entry.name, 'cat_picture.jpg');
  });

  step('getFileUrlBasicUsage', { needs: ['sendFileBasicUsage'], proves: 'getFileUrl builds a URL that serves the uploaded bytes.' }, async () => {
    const pubnub = world.shopper;
    const { id, name } = uploadedFile();
    // snippet.getFileUrlBasicUsage
    const response = pubnub.getFileUrl({ channel: 'my_channel', id: '...', name: 'cat_picture.jpg' });
    // snippet.end
    assert.match(response, /^https:\/\//);
    assert.ok(response.includes(`/files/${id}/`), 'the URL carries the file id');
    assert.ok(response.includes(`/${name}?`), 'the URL carries the file name');
    assert.ok(response.includes(encodeURIComponent(world.n('my_channel'))), 'the URL carries the channel');
    // The URL with the real file name serves the uploaded bytes.
    const real = pubnub.getFileUrl({ channel: world.n('my_channel'), id, name });
    const served = await fetch(real);
    assert.equal(served.status, 200);
    assert.deepEqual(Buffer.from(await served.arrayBuffer()), original);
  });

  step('downloadFileNodeBasicUsage', { needs: ['sendFileBasicUsage'], timeout: 60_000, proves: 'downloadFile in Node writes the downloaded content to the output file.' }, async () => {
    const pubnub = world.shopper;
    uploadedFile();
    const workdir = enterWorkdir();
    const logs = world.captureConsole('log');
    try {
      fs.writeFileSync('./cat_picture.jpg', 'placeholder to be overwritten');
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

      output.once('finish', () => {
        console.log('File saved to ./cat_picture.jpg');
      });
      // snippet.end
      await eventually(() => {
        assert.deepEqual(fs.readFileSync('./cat_picture.jpg'), original);
      }, { label: 'downloaded file written' });
      await eventually(() => {
        assert.ok(logs.lines.includes('File saved to ./cat_picture.jpg'), 'the finish handler logged the confirmation');
      }, { label: 'finish event logged' });
      assert.equal(downloadFileResponse.name, 'cat_picture.jpg');
    } finally {
      logs.restore();
      workdir.restore();
    }
  });


  step('publishFileMessageBasicUsage', { needs: ['sendFileBasicUsage'], proves: 'publishFileMessage announces the uploaded file and the event is matched by timetoken.' }, async () => {
    const pubnub = world.shopper;
    const { id } = uploadedFile();
    const listening = await watch(world.fresh('fileobserver'), [world.n('my_channel')]);
    // snippet.publishFileMessageBasicUsage
    const fileMessageResponse = await pubnub.publishFile({
      channel: 'my_channel',
      fileId: '...',
      fileName: 'cat_picture.jpg',
      message: { field: 'value' },
      customMessageType: 'file-message',
    });
    console.log('File message published successfully:', fileMessageResponse);
    // snippet.end
    world.check.timetoken(fileMessageResponse.timetoken);
    const event = await listening.next('file', (e) => e.timetoken === String(fileMessageResponse.timetoken));
    assert.equal(event.file?.id, id);
    assert.deepEqual(event.message, { field: 'value' });
    listening.stop();
  });

  // ---- FileInput forms and PubNubFile in Node ---------------------------------------------------------------------

  check('fileInputNodeForms', { needs: ['preflightFiles'], timeout: 90_000, proves: 'Every Node file input form listed on the page uploads and downloads correctly.' }, async () => {
    // The docs list stream, buffer, ArrayBuffer and string forms for Node.js. Each one must upload and come back unchanged.
    const pubnub = world.shopper;
    const channel = world.n('my_channel');
    const text = 'sneaker drop receipt';
    const forms: Array<{ label: string; file: Parameters<typeof pubnub.sendFile>[0]['file']; expected: Buffer }> = [
      { label: 'stream', file: { stream: Readable.from([original]), name: 'stream.jpg', mimeType: 'image/jpeg' }, expected: original },
      { label: 'buffer', file: { data: original, name: 'buffer.jpg', mimeType: 'image/jpeg' }, expected: original },
      { label: 'ArrayBuffer', file: { data: new Uint8Array(original).buffer, name: 'arraybuffer.jpg', mimeType: 'image/jpeg' }, expected: original },
      { label: 'string', file: { data: text, name: 'string.txt', mimeType: 'text/plain' }, expected: Buffer.from(text) },
    ];
    for (const form of forms) {
      const sent = await pubnub.sendFile({ channel, file: form.file });
      try {
        const name = (form.file as { name: string }).name;
        const downloaded = await pubnub.downloadFile({ channel, id: sent.id, name });
        assert.deepEqual(await downloaded.toBuffer(), form.expected, `${form.label} round trip`);
      } finally {
        await pubnub.deleteFile({ channel, id: sent.id, name: (form.file as { name: string }).name });
      }
    }
  });

  check('pubnubFileNodeMethods', { needs: ['sendFileBasicUsage'], timeout: 60_000, proves: 'The PubNubFile conversions that work in Node work and the others reject as the page table says.' }, async () => {
    // Docs, "Methods supported in Node.js": toBuffer, toStream, toString, toArrayBuffer work. toFile, toBlob and toFileUri reject.
    const pubnub = world.shopper;
    const { id, name } = uploadedFile();
    const channel = world.n('my_channel');
    const read = async () => pubnub.downloadFile({ channel, id, name });
    const stream = await (await read()).toStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    assert.deepEqual(Buffer.concat(chunks), original, 'toStream');
    assert.deepEqual(await (await read()).toBuffer(), original, 'toBuffer');
    assert.deepEqual(Buffer.from(await (await read()).toArrayBuffer()), original, 'toArrayBuffer');
    assert.equal((await (await read()).toString('base64')), original.toString('base64'), 'toString with an encoding');
    for (const method of ['toFile', 'toBlob', 'toFileUri'] as const) {
      const target = await read();
      await assert.rejects(() => (target as unknown as Record<string, () => Promise<unknown>>)[method](), /only supported in/, `${method} rejects in Node`);
    }
  });

  // ---- teardown ---------------------------------------------------------------------------------------------------

  step('deleteFileBasicUsage', { phase: 'P9', needs: ['publishFileMessageBasicUsage', 'downloadFileNodeBasicUsage', 'getFileUrlBasicUsage', 'listFilesBasicUsage'], proves: 'deleteFile removes the file and a later listing no longer shows it.' }, async () => {
    const pubnub = world.shopper;
    uploadedFile();
    // snippet.deleteFileBasicUsage
    const deleteFileResponse = await pubnub.deleteFile({
      channel: 'my_channel',
      id: '...',
      name: 'cat_picture.jpg',
    });
    console.log('File deleted successfully:', deleteFileResponse);
    // snippet.end
    assert.equal(deleteFileResponse.status, 200);
    await eventually(async () => {
      const left = await world.observer.listFiles({ channel: world.n('my_channel') });
      assert.ok(!left.data.some((f) => f.id === uploaded!.id), 'the file is no longer listed');
    }, { label: 'file removed from the list' });
  });
});
