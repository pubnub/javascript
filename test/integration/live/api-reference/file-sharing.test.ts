import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import type PubNub from 'pubnub';
import { assertTimetoken } from '../support/assertions';
import { captureConsole } from '../support/console';
import { createClient, observer, shopper } from '../support/clients';
import { withPlaceholders } from '../support/placeholders';
import { enterWorkdir, FIXTURE_FILE } from '../support/file-workdir';
import { eventually, watch } from '../support/wait';

/**
 * File sharing examples for Node.js. Port of docs-snippets/api-reference/file-sharing.ts.
 * The open keyset needs File Sharing and Message Persistence enabled.
 *
 * Files persist on the shared channel 'my_channel', so every test asserts on the file id it got back and an `afterEach`
 * deletes every file the test uploaded. Samples that show the id placeholder '...' run unchanged: the test passes them a
 * client wrapper (`withPlaceholders`) that swaps '...' for the id of the file the test uploaded.
 */
describe('api-reference/file-sharing', () => {
  // Plain bytes of the fixture, the reference every download is compared against.
  const original = fs.readFileSync(FIXTURE_FILE);
  const CHANNEL = 'my_channel';
  const NAME = 'cat_picture.jpg';
  let uploads: Array<{ id: string; name: string }> = [];

  /** Uploads the fixture outside any sample and registers it for deletion. */
  const upload = async (client: PubNub): Promise<{ id: string; name: string }> => {
    const response = await client.sendFile({
      channel: CHANNEL,
      file: { data: original, name: NAME, mimeType: 'image/jpeg' },
      customMessageType: 'file-message',
    });
    const entry = { id: response.id, name: response.name };
    uploads.push(entry);
    return entry;
  };

  afterEach(async () => {
    const cleaner = createClient('open', 'file-cleaner');
    const pending = uploads;
    uploads = [];
    for (const file of pending) {
      try {
        await cleaner.deleteFile({ channel: CHANNEL, id: file.id, name: file.name });
      } catch {
        // Already deleted by the test itself.
      }
    }
  });

  it('sendFileBasicUsage: sendFile uploads the picture and a second client receives the file event', async function () {
    this.timeout(60_000);
    const pubnub = shopper();
    const listening = await watch(observer(), [CHANNEL]);
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
      uploads.push({ id: response.id, name: response.name });
      assert.equal(response.name, 'cat_picture.jpg');
      const event = await listening.next('file', (e) => e.file?.id === response.id);
      assert.equal(event.channel, CHANNEL);
      assert.equal(event.file?.name, 'cat_picture.jpg');
      assert.equal(event.publisher, pubnub.getUserId());
    } finally {
      listening.stop();
      workdir.restore();
    }
  });

  it('listFilesBasicUsage: listFiles returns the file this test uploaded', async function () {
    this.timeout(60_000);
    const { id } = await upload(shopper());
    const pubnub = shopper();
    // snippet.listFilesBasicUsage
    const response = await pubnub.listFiles({ channel: 'my_channel' });
    console.log('Files listed successfully:', response);
    // snippet.end
    // The channel is shared, so look for this run's file by id. The sample lists the default page only, which holds the newest files.
    const entry = response.data.find((f) => f.id === id);
    assert.ok(entry, 'the uploaded file is listed');
    assert.equal(entry.name, 'cat_picture.jpg');
  });

  it('getFileUrlBasicUsage: getFileUrl builds a URL that serves the uploaded bytes', async function () {
    this.timeout(60_000);
    const { id, name } = await upload(shopper());
    const pubnub = withPlaceholders(shopper(), { '...': id });
    // snippet.getFileUrlBasicUsage
    const response = pubnub.getFileUrl({ channel: 'my_channel', id: '...', name: 'cat_picture.jpg' });
    // snippet.end
    assert.match(response, /^https:\/\//);
    assert.ok(response.includes(`/files/${id}/`), 'the URL carries the file id');
    assert.ok(response.includes(`/${name}?`), 'the URL carries the file name');
    assert.ok(response.includes(encodeURIComponent(CHANNEL)), 'the URL carries the channel');
    const served = await fetch(response);
    assert.equal(served.status, 200);
    assert.deepEqual(Buffer.from(await served.arrayBuffer()), original);
  });

  it('downloadFileNodeBasicUsage: downloadFile in Node writes the downloaded content to the output file', async function () {
    this.timeout(60_000);
    const { id } = await upload(shopper());
    const pubnub = withPlaceholders(shopper(), { '...': id });
    const workdir = enterWorkdir();
    const logs = captureConsole('log');
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
      await eventually(
        () => {
          assert.deepEqual(fs.readFileSync('./cat_picture.jpg'), original);
        },
        { label: 'downloaded file written' },
      );
      await eventually(
        () => {
          assert.ok(
            logs.lines.includes('File saved to ./cat_picture.jpg'),
            'the finish handler logged the confirmation',
          );
        },
        { label: 'finish event logged' },
      );
      assert.equal(downloadFileResponse.name, 'cat_picture.jpg');
    } finally {
      logs.restore();
      workdir.restore();
    }
  });

  it('publishFileMessageBasicUsage: publishFile announces the uploaded file and the event is matched by timetoken', async function () {
    this.timeout(60_000);
    const { id } = await upload(shopper());
    const pubnub = withPlaceholders(shopper(), { '...': id });
    const listening = await watch(observer(), [CHANNEL]);
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
    assertTimetoken(fileMessageResponse.timetoken);
    const event = await listening.next('file', (e) => e.timetoken === String(fileMessageResponse.timetoken));
    assert.equal(event.file?.id, id);
    assert.deepEqual(event.message, { field: 'value' });
    listening.stop();
  });

  // ---- FileInput forms and PubNubFile in Node ---------------------------------------------------------------------

  it('fileInputNodeForms: every Node file input form listed on the page uploads and downloads correctly', async function () {
    this.timeout(90_000);
    // The docs list stream, buffer, ArrayBuffer and string forms for Node.js. Each one must upload and come back unchanged.
    const pubnub = shopper();
    const text = 'sneaker drop receipt';
    const forms: Array<{ label: string; file: Parameters<typeof pubnub.sendFile>[0]['file']; expected: Buffer }> = [
      {
        label: 'stream',
        file: { stream: Readable.from([original]), name: 'stream.jpg', mimeType: 'image/jpeg' },
        expected: original,
      },
      { label: 'buffer', file: { data: original, name: 'buffer.jpg', mimeType: 'image/jpeg' }, expected: original },
      {
        label: 'ArrayBuffer',
        file: { data: new Uint8Array(original).buffer, name: 'arraybuffer.jpg', mimeType: 'image/jpeg' },
        expected: original,
      },
      {
        label: 'string',
        file: { data: text, name: 'string.txt', mimeType: 'text/plain' },
        expected: Buffer.from(text),
      },
    ];
    for (const form of forms) {
      const name = (form.file as { name: string }).name;
      const sent = await pubnub.sendFile({ channel: CHANNEL, file: form.file });
      uploads.push({ id: sent.id, name });
      const downloaded = await pubnub.downloadFile({ channel: CHANNEL, id: sent.id, name });
      assert.deepEqual(await downloaded.toBuffer(), form.expected, `${form.label} round trip`);
    }
  });

  it('pubnubFileNodeMethods: the PubNubFile conversions that work in Node work and the others reject as the page table says', async function () {
    this.timeout(60_000);
    // Docs, "Methods supported in Node.js": toBuffer, toStream, toString, toArrayBuffer work. toFile, toBlob and toFileUri reject.
    const pubnub = shopper();
    const { id, name } = await upload(pubnub);
    const read = async () => pubnub.downloadFile({ channel: CHANNEL, id, name });
    const stream = await (await read()).toStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    assert.deepEqual(Buffer.concat(chunks), original, 'toStream');
    assert.deepEqual(await (await read()).toBuffer(), original, 'toBuffer');
    assert.deepEqual(Buffer.from(await (await read()).toArrayBuffer()), original, 'toArrayBuffer');
    assert.equal(await (await read()).toString('base64'), original.toString('base64'), 'toString with an encoding');
    for (const method of ['toFile', 'toBlob', 'toFileUri'] as const) {
      const target = await read();
      await assert.rejects(
        () => (target as unknown as Record<string, () => Promise<unknown>>)[method](),
        /only supported in/,
        `${method} rejects in Node`,
      );
    }
  });

  it('deleteFileBasicUsage: deleteFile removes the file and a later listing no longer shows it', async function () {
    this.timeout(60_000);
    const { id } = await upload(shopper());
    const pubnub = withPlaceholders(shopper(), { '...': id });
    // snippet.deleteFileBasicUsage
    const deleteFileResponse = await pubnub.deleteFile({
      channel: 'my_channel',
      id: '...',
      name: 'cat_picture.jpg',
    });
    console.log('File deleted successfully:', deleteFileResponse);
    // snippet.end
    assert.equal(deleteFileResponse.status, 200);
    await eventually(
      async () => {
        const left = await observer().listFiles({ channel: CHANNEL });
        assert.ok(!left.data.some((f) => f.id === id), 'the file is no longer listed');
      },
      { label: 'file removed from the list' },
    );
  });
});
