import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from 'chai';
import fs from 'fs';

import {
  CryptoModule,
  AesCbcCryptor,
  LegacyCryptor,
} from '../../../../lib/crypto/modules/NodeCryptoModule/nodeCryptoModule.js';

Before(function () {
  this.useRandomIVs = true;
});

Given('Crypto module with {string} cryptor', function (cryptorIdentifier: string) {
  this.cryptorIdentifier = cryptorIdentifier;
});

Given(
  'Crypto module with default {string} and additional {string} cryptors',
  function (defaultCryptorId: string, additionalCryptorId: string) {
    this.defaultCryptorId = defaultCryptorId;
    this.additionalCryptorId = additionalCryptorId;
  },
);

Given('with {string} cipher key', function (cipherKey: string) {
  this.cipherKey = cipherKey;
});

Given('with {string} vector', function (vector: string) {
  if (vector === 'constant') this.useRandomIVs = false;
  this._initCryptor = (id: string) => {
    return id === 'legacy'
      ? new LegacyCryptor({ cipherKey: this.cipherKey, useRandomIVs: this.useRandomIVs })
      : new AesCbcCryptor({ cipherKey: this.cipherKey });
  };
});

When('I decrypt {string} file', async function (fileName: string) {
  if (this.cryptorIdentifier === 'acrh') {
    const cryptor = new AesCbcCryptor({ cipherKey: this.cipherKey });
    this.cryptoModule = CryptoModule.withDefaultCryptor(cryptor);
  }
  const pubnub = await this.getPubnub({ subscribeKey: 'key' });
  const fileData = fs.readFileSync(this.getFilePath(fileName));
  const file = pubnub.File.create({
    name: fileName,
    mimeType: 'text/plain',
    data: fileData,
  });
  try {
    const result = await this.cryptoModule.decryptFile(file, pubnub.File);
  } catch (e: any) {
    this.errorMessage = e?.message;
  }
});

When('I decrypt {string} file as {string}', async function (fileName: string, format: string) {
  if (this.defaultCryptorId && this.additionalCryptorId) {
    this.cryptoModule = new CryptoModule({
      default: this._initCryptor(this.defaultCryptorId),
      cryptors: [this._initCryptor(this.additionalCryptorId)],
    });
  } else {
    this.cryptoModule = CryptoModule.withDefaultCryptor(this._initCryptor(this.cryptorIdentifier));
  }

  const pubnub = await this.getPubnub({ subscribeKey: 'key' });

  if (format === 'binary') {
    this.isBinary = true;
    if (!this.useRandomIVs) return;
    let encrypteFile = pubnub.File.create({
      name: fileName,
      data: fs.readFileSync(this.getFilePath(fileName)),
    });
    try {
      this.binaryFileResult = await this.cryptoModule.decryptFile(encrypteFile, pubnub.File);
    } catch (e: any) {
      this.errorMessage = e?.message;
    }
  } else if (format === 'stream') {
    this.isStream = true;
    const filestream = fs.createReadStream(this.getFilePath(fileName));
    this.file = pubnub.File.create({
      name: fileName,
      stream: filestream,
    });
    try {
      this.streamFileResult = await this.cryptoModule.decryptFile(this.file, pubnub.File);
    } catch (e: any) {
      this.errorMessage = e?.message;
    }
  }
});

Then('Decrypted file content equal to the {string} file content', async function (sourceFile: string) {
  if (this.isBinary && !this.useRandomIVs) return;
  if (this.isStream) {
    const fileStream = await this.streamFileResult.toStream();
    const tempFilePath = `${__dirname}/${this.file.name}`;
    const outputStream = fs.createWriteStream(tempFilePath);
    const expected = fs.readFileSync(this.getFilePath(sourceFile));
    fileStream.pipe(outputStream);
    return new Promise((resolve) => {
      outputStream.on('finish', () => {
        try {
          const actual = fs.readFileSync(tempFilePath);
          expect(Buffer.compare(actual, expected.slice(0, actual.length)) === 0).to.be.true;
        } finally {
          fs.unlink(tempFilePath, () => {});
        }
        resolve(0);
      });
    });
  }
  expect(this.binaryFileResult.data.equals(fs.readFileSync(this.getFilePath(sourceFile)))).to.be.true;
});

Then('I receive {string}', async function (result: string) {
  if ((this.isBinaryFile || this.isBinary) && !this.useRandomIVs) return;
  if (result === 'success') {
    expect(this.errorMessage).to.be.undefined;
  } else {
    expect(this.errorMessage).to.have.string(result);
  }
});

Given('Legacy code with {string} cipher key and {string} vector', function (cipherKey: string, vector: string) {
  const cryptor = new LegacyCryptor({ cipherKey: cipherKey, useRandomIVs: vector === 'random' ? true : false });
  this.cryptoModule = CryptoModule.withDefaultCryptor(cryptor);
});

When('I encrypt {string} file as {string}', async function (fileName: string, format: string) {
  this.pubnub = await this.getPubnub({ subscribeKey: 'key' });
  this.fileDataBuffer = fs.readFileSync(this.getFilePath(fileName));
  if (format === 'stream') {
    this.file = this.pubnub.File.create({
      name: fileName,
      mimeType: 'application/octet-stream',
      stream: fs.createReadStream(this.getFilePath(fileName)),
    });
    this.isStream = true;
  } else {
    this.file = this.pubnub.File.create({
      name: fileName,
      mimeType: 'application/octet-stream',
      data: this.fileDataBuffer,
    });
    this.isBinaryFile = true;
  }
  if (!this.cryptoModule) {
    this.cryptoModule = CryptoModule.withDefaultCryptor(this._initCryptor(this.cryptorIdentifier));
  }
  try {
    this.encryptedFile = await this.cryptoModule.encryptFile(this.file, this.pubnub.File);
  } catch (e: any) {
    this.errorMessage = e?.message;
  }
});

Then('Successfully decrypt an encrypted file with legacy code', async function () {
  const decryptedFile = await this.cryptoModule.decryptFile(this.encryptedFile, this.pubnub.File);
  if (this.isStream) {
    const fileStream = await decryptedFile.toStream();
    const tempFilePath = `${__dirname}/${this.file.name}`;
    const outputStream = fs.createWriteStream(tempFilePath);
    fileStream.pipe(outputStream);
    outputStream.on('end', () => {
      const actualFileBuffer = fs.readFileSync(tempFilePath);
      //@ts-ignore
      expect(actualFileBuffer).to.equalBytes(this.fileDataBuffer);
      fs.unlink(tempFilePath, () => {});
    });
  } else {
    expect(decryptedFile.data.toString('utf8')).to.equal(this.fileDataBuffer.toString('utf8'));
  }
});
