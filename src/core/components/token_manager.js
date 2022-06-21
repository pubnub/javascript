export default class {
  _config;

  _cbor;

  _token;

  constructor(config, cbor) {
    this._config = config;
    this._cbor = cbor;
  }

  setToken(token) {
    if (token && token.length > 0) {
      this._token = token;
    } else {
      this._token = undefined;
    }
  }

  getToken() {
    return this._token;
  }

  extractPermissions(permissions) {
    const permissionsResult = {
      read: false,
      write: false,
      manage: false,
      delete: false,
      get: false,
      update: false,
      join: false,
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

  parseToken(tokenString) {
    const parsed = this._cbor.decodeToken(tokenString);

    if (parsed !== undefined) {
      const uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
      const channelResourcePermissions = Object.keys(parsed.res.chan);
      const groupResourcePermissions = Object.keys(parsed.res.grp);
      const uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
      const channelPatternPermissions = Object.keys(parsed.pat.chan);
      const groupPatternPermissions = Object.keys(parsed.pat.grp);

      const result = {
        version: parsed.v,
        timestamp: parsed.t,
        ttl: parsed.ttl,
        authorized_uuid: parsed.uuid,
      };

      const uuidResources = uuidResourcePermissions.length > 0;
      const channelResources = channelResourcePermissions.length > 0;
      const groupResources = groupResourcePermissions.length > 0;

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

      const uuidPatterns = uuidPatternPermissions.length > 0;
      const channelPatterns = channelPatternPermissions.length > 0;
      const groupPatterns = groupPatternPermissions.length > 0;

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
    }
    return undefined;
  }
}
