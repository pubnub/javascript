/* global describe, it, beforeEach */

import assert from 'assert';

import { DeleteFileRequest } from '../../../src/core/endpoints/file_upload/delete_file';
import { DownloadFileRequest } from '../../../src/core/endpoints/file_upload/download_file';
import { GetFileDownloadUrlRequest } from '../../../src/core/endpoints/file_upload/get_file_url';
import { PubNubFileConstructor, PubNubFileInterface } from '../../../src/core/types/file';
import { KeySet } from '../../../src/core/types/api';
import { encodeString } from '../../../src/core/utils';

/**
 * Minimal stub so DownloadFileRequest can be constructed for path checks.
 */
const stubPubNubFile = {} as PubNubFileConstructor<PubNubFileInterface, Record<string, unknown>>;

describe('file upload path encoding', () => {
  let keySet: KeySet;
  const channel = 'public-channel';
  const id = 'file-id-123';
  const name = 'report.pdf';

  beforeEach(() => {
    keySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
    };
  });

  describe('GetFileDownloadUrlRequest', () => {
    it('should encode channel, id, and name in the path', () => {
      const request = new GetFileDownloadUrlRequest({ channel, id, name, keySet });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(name)}`,
      );
    });

    it('should percent-encode path separators in name so URL normalization cannot leave the files endpoint', () => {
      const maliciousName = '../../../../../../../v3/pam/grant';
      const request = new GetFileDownloadUrlRequest({ channel, id, name: maliciousName, keySet });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(maliciousName)}`,
      );
      assert(path.includes('%2F'));
      assert(!path.includes('/v3/pam/grant'));

      const resolved = new URL(path, 'https://ps.pndsn.com');
      assert.equal(resolved.pathname, path);
      assert(!resolved.pathname.endsWith('/v3/pam/grant'));
    });

    it('should percent-encode path separators in id', () => {
      const maliciousId = '../other-channel/files/other-id';
      const request = new GetFileDownloadUrlRequest({ channel, id: maliciousId, name, keySet });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(maliciousId)}/${encodeString(name)}`,
      );
      assert(path.includes(encodeString(maliciousId)));
    });
  });

  describe('DownloadFileRequest', () => {
    it('should encode channel, id, and name in the path', () => {
      const request = new DownloadFileRequest({
        channel,
        id,
        name,
        keySet,
        PubNubFile: stubPubNubFile,
      });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(name)}`,
      );
    });

    it('should percent-encode traversal sequences in name', () => {
      const maliciousName = '../../../../../../../v3/pam/grant';
      const request = new DownloadFileRequest({
        channel,
        id,
        name: maliciousName,
        keySet,
        PubNubFile: stubPubNubFile,
      });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(maliciousName)}`,
      );

      const resolved = new URL(path, 'https://ps.pndsn.com');
      assert.equal(resolved.pathname, path);
    });
  });

  describe('DeleteFileRequest', () => {
    it('should encode channel, id, and name in the path', () => {
      const request = new DeleteFileRequest({ channel, id, name, keySet });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(name)}`,
      );
    });

    it('should percent-encode traversal sequences in name', () => {
      const maliciousName = '../../../../../../../v3/pam/grant';
      const request = new DeleteFileRequest({ channel, id, name: maliciousName, keySet });
      const { path } = request.request();

      assert.equal(
        path,
        `/v1/files/${keySet.subscribeKey}/channels/${encodeString(channel)}/files/${encodeString(id)}/${encodeString(maliciousName)}`,
      );

      const resolved = new URL(path, 'https://ps.pndsn.com');
      assert.equal(resolved.pathname, path);
    });
  });
});
