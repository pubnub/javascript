import { defineParameterType } from '@cucumber/cucumber';
import {
  RESOURCE_TYPE,
  ACCESS_PERMISSION
} from './enums';

defineParameterType({ 
    name: 'resource_type',
    regexp: new RegExp(Object.keys(RESOURCE_TYPE).join("|")),
    transformer: enum_value => RESOURCE_TYPE[enum_value]
});

defineParameterType({ 
    name: 'access_permission',
    regexp: new RegExp(Object.keys(ACCESS_PERMISSION).join("|")),
    transformer: enum_value => ACCESS_PERMISSION[enum_value]
});