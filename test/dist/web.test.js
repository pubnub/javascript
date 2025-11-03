/* global describe, beforeEach, it, before, afterEach, after, chai */
/* eslint no-console: 0 */

import { expect } from 'chai';
import PubNub from '../../src/web';

var pubnub;

describe('#distribution test (web)', function () {
  before(function () {
    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
    });
  });

  after(function () {
    pubnub.destroy();
  });

  describe('#File', function () {
    it('should have access to File property on pubnub instance', function () {
      expect(pubnub.File).to.be.a('function');
      expect(pubnub.File).to.have.property('create');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with data object', function () {
      var fileData = {
        data: 'Hello World',
        name: 'test.txt',
        mimeType: 'text/plain',
      };

      var file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('test.txt');
      expect(file).to.have.property('mimeType').equal('text/plain');
      expect(file).to.have.property('data');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with Blob', function () {
      var blob = new Blob(['test content'], { type: 'text/plain' });
      var fileData = {
        data: blob,
        name: 'blob-test.txt',
        mimeType: 'text/plain',
      };

      var file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('blob-test.txt');
      expect(file).to.have.property('mimeType').equal('text/plain');
    });

    it('should be able to create a PubNubFile using pubnub.File.create() with ArrayBuffer', function () {
      var buffer = new ArrayBuffer(8);
      var fileData = {
        data: buffer,
        name: 'buffer-test.bin',
        mimeType: 'application/octet-stream',
      };

      var file = pubnub.File.create(fileData);

      expect(file).to.be.an('object');
      expect(file).to.have.property('name').equal('buffer-test.bin');
      expect(file).to.have.property('mimeType').equal('application/octet-stream');
    });

    it('should throw error when creating PubNubFile without required parameters', function () {
      expect(function () {
        pubnub.File.create({});
      }).to.throw();
    });
  });
});
