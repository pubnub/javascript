import { defineParameterType } from '@cucumber/cucumber';
import { ResourceType, AccessPermission } from '../contract/shared/enums';

defineParameterType({
  name: 'resource_type',
  regexp: new RegExp(Object.keys(ResourceType).join('|')),
  transformer: (enum_value) => ResourceType[enum_value as keyof typeof ResourceType],
});

defineParameterType({
  name: 'access_permission',
  regexp: new RegExp(Object.keys(AccessPermission).join('|')),
  transformer: (enum_value) => AccessPermission[enum_value as keyof typeof AccessPermission],
});
