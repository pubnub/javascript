/** @flow */

import util from 'util';
import PubNub from '../../src/node';

import fs from 'fs';

describe('File Upload API v1 tests', () => {
  const SUBSCRIBE_KEY = 'demo-36';
  const PUBLISH_KEY = 'demo-36';

  const TEST_PREFIX = 'javascript-fileUploadApiV1-tests';
  const UUID = `${TEST_PREFIX}-main`;
  const UUID_1 = `${TEST_PREFIX}-uuid-1`;

  const CHANNEL_1 = `demo-channel`;

  const FILE_1 = `${TEST_PREFIX}-file-1`;

  let pubnub: PubNub;

  before(() => {
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      origin: 'ingress-files.aws-pdx-1.ps.pn',
      // logVerbosity: true
    });
  });

  after(() => {
    pubnub.unsubscribeAll();
    pubnub.destroy();
  });

  it('should export File class in PubNub instance', async () => {
    expect(pubnub.File).to.exist;
  });

  it('should handle node.js streams', async () => {
    const testFile = fs.createReadStream(`${__dirname}/testFile.json`);

    const result = await pubnub.sendFile({ channel: CHANNEL_1, file: { stream: testFile } });

    expect(result.name).to.equal('testFile.json');

    const file = await pubnub.downloadFile({
      channel: CHANNEL_1,
      id: result.id,
      name: result.name,
    });

    const stream = await file.toStream();

    expect(stream.readable).to.be.true;
  }).timeout(10000);

  it('should handle node.js buffers', async () => {
    const testContent = `Hello world! ${new Date().toLocaleString()}`;

    const result = await pubnub.sendFile({
      message: { myMessage: 42 },
      channel: CHANNEL_1,
      file: { buffer: Buffer.from(testContent), name: 'myFile.txt', mimeType: 'text/plain' },
    });

    expect(result.name).to.equal('myFile.txt');

    const file = await pubnub.downloadFile({
      channel: CHANNEL_1,
      id: result.id,
      name: result.name,
    });

    const output = await file.toBuffer();

    expect(output.toString('utf8')).to.equal(testContent);
  }).timeout(10000);

  let fileId;
  let fileName;

  it('should handle strings', (done) => {
    const testContent = `Hello world! ${new Date().toLocaleString()}`;

    pubnub.sendFile(
      {
        channel: CHANNEL_1,
        file: { data: testContent, name: 'someFile.txt', mimeType: 'text/plain' },
      },
      (err, result) => {
        expect(result.name).to.equal('someFile.txt');

        pubnub.downloadFile(
          {
            channel: CHANNEL_1,
            id: result.id,
            name: result.name,
          },
          (err2, file) => {
            fileId = result.id;
            fileName = result.name;

            const output = file.toString('utf8').then((output) => {
              expect(output).to.equal(testContent);

              done();
            });
          }
        );
      }
    );
  }).timeout(10000);

  it('should list all available files on a channel', async () => {
    const result = await pubnub.listFiles({ channel: CHANNEL_1 });

    expect(result.status).to.equal(200);
    expect(result.data).to.have.length.greaterThan(0);
  });

  it('should handle file delete', async () => {
    const result = await pubnub.deleteFile({ channel: CHANNEL_1, id: fileId, name: fileName });

    expect(result.status).to.equal(200);
  });
});
