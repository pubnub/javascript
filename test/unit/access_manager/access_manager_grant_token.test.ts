/* global describe, it, beforeEach */

import assert from 'assert';
import { GrantTokenRequest } from '../../../src/core/endpoints/access_manager/grant_token';
import { TransportResponse } from '../../../src/core/types/transport-response';
import { TransportMethod } from '../../../src/core/types/transport-request';
import RequestOperation from '../../../src/core/constants/operations';
import { KeySet } from '../../../src/core/types/api';
import * as PAM from '../../../src/core/types/api/access-manager';

// Helper function to parse body as string
function parseBodyAsString(body: string | ArrayBuffer | any): any {
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  throw new Error('Expected body to be string');
}

describe('GrantTokenRequest', () => {
  let defaultKeySet: KeySet;
  let defaultParameters: PAM.GrantTokenParameters & { keySet: KeySet };

  beforeEach(() => {
    defaultKeySet = {
      publishKey: 'test_publish_key',
      subscribeKey: 'test_subscribe_key',
      secretKey: 'test_secret_key',
    };

    defaultParameters = {
      keySet: defaultKeySet,
      ttl: 60,
      resources: {
        channels: {
          test_channel: {
            read: true,
            write: true,
          },
        },
      },
    };
  });

  describe('validation', () => {
    it('should validate required subscribe key', () => {
      const requestWithoutSubscribeKey = new GrantTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, subscribeKey: '' },
      });
      assert.equal(requestWithoutSubscribeKey.validate(), "Missing Subscribe Key");
    });

    it('should validate required publish key', () => {
      const requestWithoutPublishKey = new GrantTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, publishKey: '' },
      });
      assert.equal(requestWithoutPublishKey.validate(), "Missing Publish Key");
    });

    it('should validate required secret key', () => {
      const requestWithoutSecretKey = new GrantTokenRequest({
        ...defaultParameters,
        keySet: { ...defaultKeySet, secretKey: '' },
      });
      assert.equal(requestWithoutSecretKey.validate(), "Missing Secret Key");
    });

    it('should require either resources or patterns', () => {
      const requestWithoutResourcesOrPatterns = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        // Both resources and patterns are undefined
      } as any);
      assert.equal(requestWithoutResourcesOrPatterns.validate(), "Missing values for either Resources or Patterns");
    });

    it('should require non-empty resources or patterns', () => {
      const requestWithEmptyResources = new GrantTokenRequest({
        ...defaultParameters,
        resources: {},
        patterns: {},
      });
      assert.equal(requestWithEmptyResources.validate(), "Missing values for either Resources or Patterns");
    });

    it('should require non-empty resource objects', () => {
      const requestWithEmptyResourceObjects = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {},
          groups: {},
          uuids: {},
        },
      });
      assert.equal(requestWithEmptyResourceObjects.validate(), "Missing values for either Resources or Patterns");
    });

    it('should pass validation with valid channel resources', () => {
      const validRequest = new GrantTokenRequest(defaultParameters);
      assert.equal(validRequest.validate(), undefined);
    });

    it('should pass validation with patterns', () => {
      const validPatternRequest = new GrantTokenRequest({
        ...defaultParameters,
        resources: undefined,
        patterns: {
          channels: {
            '.*': {
              read: true,
            },
          },
        },
      });
      assert.equal(validPatternRequest.validate(), undefined);
    });

    it('should pass validation with both resources and patterns', () => {
      const validBothRequest = new GrantTokenRequest({
        ...defaultParameters,
        patterns: {
          channels: {
            'pattern.*': {
              read: true,
            },
          },
        },
      });
      assert.equal(validBothRequest.validate(), undefined);
    });
  });

  describe('VSP legacy permissions validation', () => {
    it('should validate VSP authorizedUserId without new permission fields', () => {
      const vspRequest = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        authorizedUserId: 'user123',
        resources: {
          users: {
            user1: {
              get: true, // VSP legacy - using valid UuidTokenPermissions property
            },
          },
        },
      } as any); // Type assertion for VSP legacy
      assert.equal(vspRequest.validate(), undefined);
    });

    it('should reject mixing VSP and new permissions in resources', () => {
      const mixedRequest = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        authorizedUserId: 'user123',
        resources: {
          users: {
            user1: {
              get: true,
            },
          },
          channels: {
            channel1: {
              read: true,
            },
          },
        },
      } as any); // Type assertion for VSP legacy
      assert.equal(
        mixedRequest.validate(),
        "Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`, `groups` and `authorized_uuid`"
      );
    });

    it('should reject mixing VSP and new permissions in patterns', () => {
      const mixedRequest = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        authorizedUserId: 'user123',
        resources: {
          users: {
            user1: {
              get: true,
            },
          },
        },
        patterns: {
          channels: {
            '.*': {
              read: true,
            },
          },
        },
      } as any); // Type assertion for VSP legacy
      assert.equal(
        mixedRequest.validate(),
        "Cannot mix `users`, `spaces` and `authorizedUserId` with `uuids`, `channels`, `groups` and `authorized_uuid`"
      );
    });
  });

  describe('operation', () => {
    it('should return PNAccessManagerGrantToken operation', () => {
      const request = new GrantTokenRequest(defaultParameters);
      assert.equal(request.operation(), RequestOperation.PNAccessManagerGrantToken);
    });
  });

  describe('request method', () => {
    it('should use POST method', () => {
      const request = new GrantTokenRequest(defaultParameters);
      const transportRequest = request.request();
      assert.equal(transportRequest.method, TransportMethod.POST);
    });
  });

  describe('URL construction', () => {
    it('should construct correct URL path', () => {
      const request = new GrantTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      const expectedPath = `/v3/pam/${defaultKeySet.subscribeKey}/grant`;
      assert.equal(transportRequest.path, expectedPath);
    });

    it('should construct URL with different subscribe key', () => {
      const customKeySet = { ...defaultKeySet, subscribeKey: 'custom_sub_key' };
      const request = new GrantTokenRequest({
        ...defaultParameters,
        keySet: customKeySet,
      });
      
      const transportRequest = request.request();
      assert.equal(transportRequest.path, `/v3/pam/custom_sub_key/grant`);
    });
  });

  describe('headers', () => {
    it('should set Content-Type header to application/json', () => {
      const request = new GrantTokenRequest(defaultParameters);
      const transportRequest = request.request();
      
      assert.equal(transportRequest.headers?.['Content-Type'], 'application/json');
    });
  });

  describe('JSON body construction', () => {
    it('should include TTL in body when specified', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        ttl: 1440,
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.ttl, 1440);
    });

    it('should include TTL when TTL is 0', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        ttl: 0,
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.ttl, 0);
    });

    it('should not include TTL when not specified', () => {
      const params = { ...defaultParameters };
      delete (params as any).ttl;
      const request = new GrantTokenRequest(params);
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.ttl, undefined);
    });

    it('should include authorized_uuid when specified', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        authorized_uuid: 'test_uuid',
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.uuid, 'test_uuid');
    });

    it('should include authorizedUserId for VSP permissions', () => {
      const request = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        authorizedUserId: 'vsp_user',
        resources: {
          users: {
            user1: {
              get: true,
            },
          },
        },
      } as any); // Type assertion for VSP legacy
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.uuid, 'vsp_user');
    });

    it('should include meta when specified', () => {
      const metaData = { key1: 'value1', key2: 'value2' };
      const request = new GrantTokenRequest({
        ...defaultParameters,
        meta: metaData,
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.deepEqual(body.permissions.meta, metaData);
    });

    it('should include empty meta object when not specified', () => {
      const request = new GrantTokenRequest(defaultParameters);
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.deepEqual(body.permissions.meta, {});
    });
  });

  describe('permission bit calculation', () => {
    it('should calculate read permission bit (1)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              read: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 1);
    });

    it('should calculate write permission bit (2)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              write: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 2);
    });

    it('should calculate manage permission bit (4)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              manage: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 4);
    });

    it('should calculate delete permission bit (8)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              delete: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 8);
    });

    it('should calculate get permission bit (32)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          uuids: {
            test_uuid: {
              get: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.uuids.test_uuid, 32);
    });

    it('should calculate update permission bit (64)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          uuids: {
            test_uuid: {
              update: true,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.uuids.test_uuid, 64);
    });

    it('should calculate join permission bit (128)', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              join: true, // join is valid for channels
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 128);
    });

    it('should combine multiple permission bits', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              read: true,     // 1
              write: true,    // 2
              manage: true,   // 4
              // Total: 1 + 2 + 4 = 7
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 7);
    });

    it('should combine all permission bits', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              read: true,     // 1
              write: true,    // 2
              manage: true,   // 4
              delete: true,   // 8
              get: true,      // 32
              update: true,   // 64
              join: true,     // 128
              // Total: 1 + 2 + 4 + 8 + 32 + 64 + 128 = 239
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 239);
    });

    it('should handle false permissions as 0', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test_channel: {
              read: false,
              write: false,
              manage: false,
              delete: false,
            },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      assert.equal(body.permissions.resources.channels.test_channel, 0);
    });
  });

  describe('resources and patterns structure', () => {
    it('should structure channel resources correctly', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            channel1: { read: true },
            channel2: { write: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.channels.channel1, 1);
      assert.equal(body.permissions.resources.channels.channel2, 2);
      assert.deepEqual(body.permissions.resources.groups, {});
      assert.deepEqual(body.permissions.resources.uuids, {});
    });

    it('should structure channel group resources correctly', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          groups: {
            group1: { read: true, manage: true },
            group2: { read: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.groups.group1, 5); // 1 + 4
      assert.equal(body.permissions.resources.groups.group2, 1); // read only
      assert.deepEqual(body.permissions.resources.channels, {});
      assert.deepEqual(body.permissions.resources.uuids, {});
    });

    it('should structure uuid resources correctly', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          uuids: {
            uuid1: { get: true, update: true },
            uuid2: { delete: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.uuids.uuid1, 96); // 32 + 64
      assert.equal(body.permissions.resources.uuids.uuid2, 8); // delete
      assert.deepEqual(body.permissions.resources.channels, {});
      assert.deepEqual(body.permissions.resources.groups, {});
    });

    it('should structure patterns correctly', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: undefined,
        patterns: {
          channels: {
            'channel.*': { read: true },
            'private.*': { read: true, write: true },
          },
          groups: {
            'group.*': { manage: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.patterns.channels['channel.*'], 1);
      assert.equal(body.permissions.patterns.channels['private.*'], 3); // 1 + 2
      assert.equal(body.permissions.patterns.groups['group.*'], 4);
      assert.deepEqual(body.permissions.patterns.uuids, {});
    });

    it('should handle both resources and patterns', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            specific_channel: { read: true },
          },
        },
        patterns: {
          channels: {
            'dynamic.*': { write: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.channels.specific_channel, 1);
      assert.equal(body.permissions.patterns.channels['dynamic.*'], 2);
    });
  });

  describe('VSP legacy permissions handling', () => {
    it('should handle VSP users as uuids', () => {
      const request = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        resources: {
          users: {
            user1: { get: true }, // VSP legacy - mapped to uuids
            user2: { get: true, update: true },
          },
        },
      } as any); // Type assertion for VSP legacy
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.uuids.user1, 32); // get
      assert.equal(body.permissions.resources.uuids.user2, 96); // 32 + 64
    });

    it('should handle VSP spaces as channels', () => {
      const request = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        resources: {
          spaces: {
            space1: { read: true, write: true },
            space2: { manage: true },
          },
        },
      } as any); // Type assertion for VSP legacy
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.channels.space1, 3); // 1 + 2
      assert.equal(body.permissions.resources.channels.space2, 4);
    });

    it('should handle VSP patterns correctly', () => {
      const request = new GrantTokenRequest({
        keySet: defaultKeySet,
        ttl: 60,
        patterns: {
          users: {
            'user.*': { get: true },
          },
          spaces: {
            'space.*': { read: true, write: true },
          },
        },
      } as any); // Type assertion for VSP legacy
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.patterns.uuids['user.*'], 32);
      assert.equal(body.permissions.patterns.channels['space.*'], 3); // 1 + 2
    });
  });

  describe('response parsing', () => {
    it('should parse successful grant token response', async () => {
      const request = new GrantTokenRequest(defaultParameters);
      const mockResponse: TransportResponse = {
        status: 200,
        url: 'https://test.pubnub.com',
        headers: { 'content-type': 'application/json' },
        body: new TextEncoder().encode(JSON.stringify({
          status: 200,
          data: {
            message: 'Success',
            token: 'p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI',
          },
          service: 'Access Manager',
        })),
      };

      const parsedResponse = await request.parse(mockResponse);
      assert.equal(parsedResponse, 'p0AkFl043rhDdHRsple3KgQ3NwY6BDcENnctokenVzcqBDczaWdYIGOAeTyWGJI');
    });
  });

  describe('edge cases', () => {
    it('should handle empty resource objects with default structure', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            test: { read: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      // Should have all resource types even if not specified
      assert.equal(typeof body.permissions.resources.channels, 'object');
      assert.equal(typeof body.permissions.resources.groups, 'object');
      assert.equal(typeof body.permissions.resources.uuids, 'object');
      
      // Should have all pattern types even if not specified
      assert.equal(typeof body.permissions.patterns.channels, 'object');
      assert.equal(typeof body.permissions.patterns.groups, 'object');
      assert.equal(typeof body.permissions.patterns.uuids, 'object');
    });

    it('should handle special characters in resource names', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: {
          channels: {
            'channel-with-dashes': { read: true },
            'channel_with_underscores': { write: true },
            'channel.with.dots': { manage: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.resources.channels['channel-with-dashes'], 1);
      assert.equal(body.permissions.resources.channels['channel_with_underscores'], 2);
      assert.equal(body.permissions.resources.channels['channel.with.dots'], 4);
    });

    it('should handle regex patterns in pattern names', () => {
      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: undefined,
        patterns: {
          channels: {
            '^channel-[A-Za-z0-9]+$': { read: true },
            '.*private.*': { write: true },
          },
        },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(body.permissions.patterns.channels['^channel-[A-Za-z0-9]+$'], 1);
      assert.equal(body.permissions.patterns.channels['.*private.*'], 2);
    });

    it('should handle large numbers of resources', () => {
      const channels: Record<string, { read: boolean }> = {};
      for (let i = 0; i < 100; i++) {
        channels[`channel_${i}`] = { read: true };
      }

      const request = new GrantTokenRequest({
        ...defaultParameters,
        resources: { channels },
      });
      
      const transportRequest = request.request();
      const body = parseBodyAsString(transportRequest.body!);
      
      assert.equal(Object.keys(body.permissions.resources.channels).length, 100);
      assert.equal(body.permissions.resources.channels.channel_0, 1);
      assert.equal(body.permissions.resources.channels.channel_99, 1);
    });
  });
});
