/**       */

import PubNub from '../../src/web/index';

function urlToFile(url, filename, mimeType) {
  return fetch(url)
    .then(function (res) {
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return new File([buf], filename, { type: mimeType });
    });
}

describe('test', () => {
  const TEST_PREFIX = 'javascript-fileUploadApiV1-tests';
  const UUID = `${TEST_PREFIX}-main`;
  const UUID_1 = `${TEST_PREFIX}-uuid-1`;

  const CHANNEL_1 = `demo-channel`;

  const FILE_1 = `${TEST_PREFIX}-file-1`;

  let pubnub;

  after(() => {
    pubnub.unsubscribeAll();
    pubnub.destroy();
  });

  describe('with encryption', () => {
    pubnub = new PubNub({
      subscribeKey: process.env.SUBSCRIBE_KEY || 'demo',
      publishKey: process.env.PUBLISH_KEY || 'demo',
      uuid: UUID,
      cipherKey: 'abcdef',
    });

    runTests(pubnub);
  });

  describe('without encryption', () => {
    pubnub = new PubNub({
      subscribeKey: process.env.SUBSCRIBE_KEY || 'demo',
      publishKey: process.env.PUBLISH_KEY || 'demo',
      uuid: UUID,
    });

    runTests(pubnub);
  });

  function runTests(pubnub) {
    it('should export File class in PubNub instance', async () => {
      expect(pubnub.File).to.exist;
    });

    it('should handle File interface with text files', async () => {
      const fileContent = 'Hello world!';
      const testFile = new File([fileContent], 'myFile.txt', {
        type: 'text/plain',
      });

      const result = await pubnub.sendFile({
        channel: CHANNEL_1,
        message: { test: 'message', value: 42 },
        file: testFile,
      });

      expect(result.name).to.equal('myFile.txt');

      const pubnubFile = await pubnub.downloadFile({ name: result.name, id: result.id, channel: CHANNEL_1 });
      const file = await pubnubFile.toFile();

      await new Promise(async (resolve) => {
        const fr = new FileReader();

        fr.addEventListener('load', () => {
          expect(fr.result).to.equal(fileContent);
          resolve();
        });

        fr.readAsBinaryString(file);
      });
    }).timeout(20000);

    it('should handle File interface with images', async () => {
      const contents = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const inputFile = await urlToFile(`data:image/png;base64,${contents}`, 'myFile.png', 'image/png');

      const result = await pubnub.sendFile({
        channel: CHANNEL_1,
        file: inputFile,
      });

      expect(result.name).to.equal('myFile.png');

      const pubnubFile = await pubnub.downloadFile({
        channel: CHANNEL_1,
        id: result.id,
        name: result.name,
      });

      const outputFile = await pubnubFile.toFile();

      await new Promise(async (resolve) => {
        const fr = new FileReader();

        fr.addEventListener('load', () => {
          if (pubnub._config.cipherKey) {
            expect(fr.result).to.equal(`data:application/octet-stream;base64,${contents}`);
          } else {
            expect(fr.result).to.equal(`data:image/png;base64,${contents}`);
          }
          resolve();
        });

        fr.readAsDataURL(outputFile);
      });
    }).timeout(20000);

    let fileId;
    let fileName;

    it('should handle strings', async () => {
      const testContent = `Hello world! ${new Date().toLocaleString()}`;

      const result = await pubnub.sendFile({
        channel: CHANNEL_1,
        file: { data: testContent, name: 'someFile.txt', mimeType: 'text/plain' },
      });

      expect(result.name).to.equal('someFile.txt');

      const file = await pubnub.downloadFile({
        channel: CHANNEL_1,
        id: result.id,
        name: result.name,
      });

      fileId = result.id;
      fileName = result.name;

      const output = await file.toString('utf8');

      expect(output).to.equal(testContent);
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
    it('should handle encryption/decryption with explicit cipherKey', async () => {
      const testContent = `Hello world! ${new Date().toLocaleString()}`;

      const result = await pubnub.sendFile({
        channel: CHANNEL_1,
        file: { data: testContent, name: 'someFile.txt', mimeType: 'text/plain' },
        cipherKey: 'cipherKey',
      });

      expect(result.name).to.equal('someFile.txt');

      const file = await pubnub.downloadFile({
        channel: CHANNEL_1,
        id: result.id,
        name: result.name,
        cipherKey: 'cipherKey',
      });

      fileId = result.id;
      fileName = result.name;

      const output = await file.toString('utf8');

      expect(output).to.equal(testContent);
    }).timeout(10000);
  }
});
