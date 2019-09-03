/* @flow */
import Config from './config';
import {
  TokensDefinition,
  GetTokensInput,
  GrantTokenOutput,
} from '../flow_interfaces';

export default class {
  _config: Config;

  _cbor: any;

  _userTokens: { [string]: string};
  _spaceTokens: { [string]: string};

  _userToken: ?string;
  _spaceToken: ?string;

  constructor(config: Config, cbor: any) {
    this._config = config;
    this._cbor = cbor;
    this._initializeTokens();
  }

  _initializeTokens() {
    this._userTokens = {};
    this._spaceTokens = {};

    this._userToken = undefined;
    this._spaceToken = undefined;
  }

  _setToken(token: string) {
    let tokenObject: GrantTokenOutput = this.parseToken(token);

    if (tokenObject && tokenObject.resources) {
      if (tokenObject.resources.users) {
        Object.keys(tokenObject.resources.users).forEach((id) => {
          this._userTokens[id] = token;
        });
      }

      if (tokenObject.resources.spaces) {
        Object.keys(tokenObject.resources.spaces).forEach((id) => {
          this._spaceTokens[id] = token;
        });
      }
    }

    if (tokenObject && tokenObject.patterns) {
      if (tokenObject.patterns.users && Object.keys(tokenObject.patterns.users).length > 0) {
        this._userToken = token;
      }

      if (tokenObject.patterns.spaces && Object.keys(tokenObject.patterns.spaces).length > 0) {
        this._spaceToken = token;
      }
    }
  }

  setToken(token: string) {
    if (token && token.length > 0) {
      this._setToken(token);
    }
  }

  setTokens(tokens: string[]) {
    if (tokens && tokens.length && typeof tokens === 'object') {
      tokens.forEach((token) => {
        this.setToken(token);
      });
    }
  }

  getTokens(tokenDef: GetTokensInput): TokensDefinition {
    let result: TokensDefinition = {
      users: {},
      spaces: {}
    };

    if (tokenDef) {
      if (tokenDef.user) {
        result.user = this._userToken;
      }

      if (tokenDef.space) {
        result.space = this._spaceToken;
      }

      if (tokenDef.users) {
        tokenDef.users.forEach((user) => {
          result.users[user] = this._userTokens[user];
        });
      }

      if (tokenDef.space) {
        tokenDef.spaces.forEach((space) => {
          result.spaces[space] = this._spaceTokens[space];
        });
      }
    } else {
      if (this._userToken) {
        result.user = this._userToken;
      }

      if (this._spaceToken) {
        result.space = this._spaceToken;
      }

      Object.keys(this._userTokens).forEach((user) => {
        result.users[user] = this._userTokens[user];
      });

      Object.keys(this._spaceTokens).forEach((space) => {
        result.spaces[space] = this._spaceTokens[space];
      });
    }

    return result;
  }

  getToken(type: string, id?: string) {
    let result;

    if (id) {
      if (type === 'user') {
        result = this._userTokens[id];
      } else if (type === 'space') {
        result = this._spaceTokens[id];
      }
    } else if (type === 'user') {
      result = this._userToken;
    } else if (type === 'space') {
      result = this._spaceToken;
    }

    return result;
  }

  extractPermissions(permissions: number) {
    let permissionsResult = {
      create: false,
      read: false,
      write: false,
      manage: false,
      delete: false,
    };

    /* eslint-disable */

    if ((permissions & 16) === 16) {
      permissionsResult.create = true;
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
      let userResourcePermissions = Object.keys(parsed.res.usr);
      let spaceResourcePermissions = Object.keys(parsed.res.spc);
      let userPatternPermissions = Object.keys(parsed.pat.usr);
      let spacePatternPermissions = Object.keys(parsed.pat.spc);

      let result: GrantTokenOutput  = {
        version: parsed.v,
        timestamp: parsed.t,
        ttl: parsed.ttl
      };

      let userResources = userResourcePermissions.length > 0;
      let spaceResources = spaceResourcePermissions.length > 0;

      if (userResources  || spaceResources) {
        result.resources = {};

        if (userResources) {
          result.resources.users = {};
          userResourcePermissions.forEach((id) => {
            result.resources.users[id] = this.extractPermissions(parsed.res.usr[id]);
          });
        }

        if (spaceResources) {
          result.resources.spaces = {};
          spaceResourcePermissions.forEach((id) => {
            result.resources.spaces[id] = this.extractPermissions(parsed.res.spc[id]);
          });
        }
      }

      let userPatterns = userPatternPermissions.length > 0;
      let spacePatterns = spacePatternPermissions.length > 0;

      if (userPatterns  || spacePatterns) {
        result.patterns = {};

        if (userPatterns) {
          result.patterns.users = {};
          userPatternPermissions.forEach((id) => {
            result.patterns.users[id] = this.extractPermissions(parsed.pat.usr[id]);
          });
        }

        if (spacePatterns) {
          result.patterns.spaces = {};
          spacePatternPermissions.forEach((id) => {
            result.patterns.spaces[id] = this.extractPermissions(parsed.pat.spc[id]);
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

  clearTokens() {
    this._initializeTokens();
  }
}
