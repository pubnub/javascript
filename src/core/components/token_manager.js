/* @flow */
import Config from './config';
import {
  GrantTokenOutput,
} from '../flow_interfaces';

export default class {
  _config: Config;

  _cbor: any;

  _token: any;

  constructor(config: Config, cbor: any) {
    this._config = config;
    this._cbor = cbor;
  }

  setToken(token: string) {
    if (token && token.length > 0) {
      this._token = token;
    } else {
      this._token = undefined;
    }
  }

  getToken() {
    return this._token;
  }

  extractPermissions(permissions: number) {
    let permissionsResult = {
      read: false,
      write: false,
      manage: false,
      delete: false,
      get: false,
      update: false,
      join: false
    };

    /* eslint-disable */

    if ((permissions & 128) === 128) {
      permissionsResult.join = true;
    }

    if ((permissions & 64) === 64) {
      permissionsResult.update = true;
    }

    if ((permissions & 32) === 32) {
      permissionsResult.get = true;
    }

    if ((permissions & 8) === 8) {
      permissionsResult.delete = true;
    }

    if ((permissions & 4) === 4) {
      permissionsResult.manage = true;
    }
    
    if ((permissions & 2) === 2) {
      permissionsResult.write = true;
    }
    
    if ((permissions & 1) === 1) {
      permissionsResult.read = true;
    }
    
    /* eslint-enable */

    return permissionsResult;
  }

  parseToken(tokenString: string): GrantTokenOutput {
    let parsed = this._cbor.decodeToken(tokenString);

    if (parsed !== undefined) {
      let uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
      let channelResourcePermissions = Object.keys(parsed.res.chan);
      let groupResourcePermissions = Object.keys(parsed.res.grp);
      let uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
      let channelPatternPermissions = Object.keys(parsed.pat.chan);
      let groupPatternPermissions = Object.keys(parsed.pat.grp);

      let result: GrantTokenOutput  = {
        version: parsed.v,
        timestamp: parsed.t,
        ttl: parsed.ttl,
        authorized_uuid: parsed.uuid
      };

      let uuidResources = uuidResourcePermissions.length > 0;
      let channelResources = channelResourcePermissions.length > 0;
      let groupResources = groupResourcePermissions.length > 0;

      if (uuidResources || channelResources || groupResources) {
        result.resources = {};

        if (uuidResources) {
          result.resources.uuids = {};
          uuidResourcePermissions.forEach((id) => {
            result.resources.uuids[id] = this.extractPermissions(parsed.res.uuid[id]);
          });
        }

        if (channelResources) {
          result.resources.channels = {};
          channelResourcePermissions.forEach((id) => {
            result.resources.channels[id] = this.extractPermissions(parsed.res.chan[id]);
          });
        }

        if (groupResources) {
          result.resources.groups = {};
          groupResourcePermissions.forEach((id) => {
            result.resources.groups[id] = this.extractPermissions(parsed.res.grp[id]);
          });
        }
      }

      let uuidPatterns = uuidPatternPermissions.length > 0;
      let channelPatterns = channelPatternPermissions.length > 0;
      let groupPatterns = groupPatternPermissions.length > 0;

      if (uuidPatterns || channelPatterns || groupPatterns) {
        result.patterns = {};

        if (uuidPatterns) {
          result.patterns.uuids = {};
          uuidPatternPermissions.forEach((id) => {
            result.patterns.uuids[id] = this.extractPermissions(parsed.pat.uuid[id]);
          });
        }

        if (channelPatterns) {
          result.patterns.channels = {};
          channelPatternPermissions.forEach((id) => {
            result.patterns.channels[id] = this.extractPermissions(parsed.pat.chan[id]);
          });
        }

        if (groupPatterns) {
          result.patterns.groups = {};
          groupPatternPermissions.forEach((id) => {
            result.patterns.groups[id] = this.extractPermissions(parsed.pat.grp[id]);
          });
        }
      }

      if (Object.keys(parsed.meta).length > 0) {
        result.meta = parsed.meta;
      }

      result.signature = parsed.sig;

      return result;
    } else {
      return undefined;
    }
  }
}
