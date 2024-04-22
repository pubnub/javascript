/**       */

export const asResponse = (fixture: Record<string, any>) => ({
  ...fixture.data,
  update: fixture.updated,
  eTag: fixture.eTag,
});

export const user1 = {
  data: {
    id: 'user-test-1',
    name: 'test-user',
    externalId: 'external-123',
    profileUrl: 'www.test-user.com',
    email: 'test@user.com',
    custom: {
      testString: 'test',
      testNum: 123,
      testBool: true,
    },
  },
  updated: new Date().toISOString(),
  eTag: 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==',
};

export const allUsers = [user1];

export const channel1 = {
  data: {
    channel: 'test-channel',
    name: 'test-channel',
    description: 'test-description',
    custom: {
      testValue: 42,
    },
  },
  updated: new Date().toISOString(),
  eTag: 'MDcyQ0REOTUtNEVBOC00QkY2LTgwOUUtNDkwQzI4MjgzMTcwCg==',
};

export const allChannels = [channel1];
