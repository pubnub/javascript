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

  it('should handle browser File interface', async () => {
    const inputFile = await urlToFile(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'myFile.png',
      'image/png'
    );

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

    expect(outputFile instanceof File).to.be.true;
    expect(outputFile.name).to.equal('myFile.png');
  }).timeout(10000);

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
});
