/**
 * Unit tests for the optional `classLevel` create parameter (pure request building, no backend).
 *
 * `classLevel` disambiguates two classes that share a name at different hierarchy levels. It is set
 * at creation time and immutable afterward, so it lives at the top level of the create parameters
 * (alongside `id` / `class`) rather than inside `data`, and maps to `entityClassLevel` in the request
 */

import assert from 'assert';

import { CreateChannelRequest } from '../../../src/core/endpoints/data_sync/channel/create';
import { CreateEntityRequest } from '../../../src/core/endpoints/data_sync/entity/create';
import { CreateUserRequest } from '../../../src/core/endpoints/data_sync/user/create';
import * as DataSync from '../../../src/core/types/api/data-sync';
import { KeySet } from '../../../src/core/types/api';

const keySet: KeySet = { subscribeKey: 'demo-sub-key', publishKey: 'demo-pub-key' };

/** Decode the JSON body a request would put on the wire. */
const bodyData = (request: { request: () => { body?: unknown } }): Record<string, unknown> => {
  const body = request.request().body;
  assert.strictEqual(typeof body, 'string', 'request body is a JSON string');
  return (JSON.parse(body as string) as { data: Record<string, unknown> }).data;
};

describe('DataSync create `classLevel`', () => {
  describe('createEntity', () => {
    const parameters = (classLevel?: DataSync.ClassLevel) => ({
      keySet,
      id: 'entity-1',
      class: 'Customer',
      ...(classLevel !== undefined ? { classLevel } : {}),
      data: { classVersion: 1, status: 'active', payload: { name: 'Alice' } },
    });

    it('maps `classLevel: "SubKey"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateEntityRequest(parameters('SubKey')));

      assert.strictEqual(data.entityClassLevel, 'SubKey');
    });

    it('maps `classLevel: "Global"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateEntityRequest(parameters('Global')));

      assert.strictEqual(data.entityClassLevel, 'Global');
    });

    it('omits `entityClassLevel` entirely when `classLevel` is not provided', () => {
      const data = bodyData(new CreateEntityRequest(parameters()));

      assert.strictEqual('entityClassLevel' in data, false, 'key absent (not null / undefined)');
    });

    it('leaves the rest of the body unchanged and does not leak into `payload`', () => {
      const data = bodyData(new CreateEntityRequest(parameters('SubKey')));

      assert.deepStrictEqual(data, {
        id: 'entity-1',
        entityClass: 'Customer',
        entityClassVersion: 1,
        entityClassLevel: 'SubKey',
        status: 'active',
        payload: { name: 'Alice' },
      });
    });
  });

  describe('createUser', () => {
    const parameters = (classLevel?: DataSync.ClassLevel) => ({
      keySet,
      id: 'user-1',
      ...(classLevel !== undefined ? { classLevel } : {}),
      data: { classVersion: 1, status: 'active', payload: { firstName: 'Alice' } },
    });

    it('maps `classLevel: "SubKey"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateUserRequest(parameters('SubKey')));

      assert.strictEqual(data.entityClassLevel, 'SubKey');
    });

    it('maps `classLevel: "Global"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateUserRequest(parameters('Global')));

      assert.strictEqual(data.entityClassLevel, 'Global');
    });

    it('omits `entityClassLevel` entirely when `classLevel` is not provided', () => {
      const data = bodyData(new CreateUserRequest(parameters()));

      assert.strictEqual('entityClassLevel' in data, false, 'key absent (not null / undefined)');
    });

    it('leaves the rest of the body unchanged and does not leak into `payload`', () => {
      const data = bodyData(new CreateUserRequest(parameters('Global')));

      assert.deepStrictEqual(data, {
        id: 'user-1',
        entityClassVersion: 1,
        entityClassLevel: 'Global',
        status: 'active',
        payload: { firstName: 'Alice' },
      });
    });
  });

  describe('createChannel', () => {
    const parameters = (classLevel?: DataSync.ClassLevel) => ({
      keySet,
      id: 'channel-1',
      ...(classLevel !== undefined ? { classLevel } : {}),
      data: { classVersion: 1, status: 'active', payload: { name: 'engineering' } },
    });

    it('maps `classLevel: "SubKey"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateChannelRequest(parameters('SubKey')));

      assert.strictEqual(data.entityClassLevel, 'SubKey');
    });

    it('maps `classLevel: "Global"` to `entityClassLevel`', () => {
      const data = bodyData(new CreateChannelRequest(parameters('Global')));

      assert.strictEqual(data.entityClassLevel, 'Global');
    });

    it('omits `entityClassLevel` entirely when `classLevel` is not provided', () => {
      const data = bodyData(new CreateChannelRequest(parameters()));

      assert.strictEqual('entityClassLevel' in data, false, 'key absent (not null / undefined)');
    });

    it('leaves the rest of the body unchanged and does not leak into `payload`', () => {
      const data = bodyData(new CreateChannelRequest(parameters('SubKey')));

      assert.deepStrictEqual(data, {
        id: 'channel-1',
        entityClassVersion: 1,
        entityClassLevel: 'SubKey',
        status: 'active',
        payload: { name: 'engineering' },
      });
    });
  });
});
