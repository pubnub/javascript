import { defineParameterType } from '@cucumber/cucumber';

export enum AccessPermission {
  read = 'read',
  write = 'write',
  get = 'get',
  manage = 'manage',
  update = 'update',
  join = 'join',
  delete = 'delete',
}

defineParameterType({
  name: 'access_permission',
  regexp: new RegExp(
    Object.keys(AccessPermission)
      .map((key) => key.toUpperCase())
      .join('|'),
  ),
  transformer: (enum_value) => AccessPermission[enum_value.toLowerCase() as keyof typeof AccessPermission],
});

export enum ResourceType {
  channel = 'channels',
  channel_group = 'groups',
  uuid = 'uuids',
}

defineParameterType({
  name: 'resource_type',
  regexp: new RegExp(
    Object.keys(ResourceType)
      .map((key) => key.toUpperCase())
      .join('|'),
  ),
  transformer: (enum_value) => ResourceType[enum_value.toLowerCase() as keyof typeof ResourceType],
});
