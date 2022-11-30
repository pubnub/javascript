import { binding, given, then, when } from 'cucumber-tsflow';
import { expect } from 'chai';

import { AccessManagerKeyset } from '../shared/keysets';
import { PubNub, PubNubManager } from '../shared/pubnub';
import {
  tokenWithKnownAuthorizedUUID,
  tokenWithUUIDPatternPermissions,
  tokenWithUUIDResourcePermissions,
} from '../shared/fixtures';
import { ResourceType, AccessPermission } from '../shared/enums';

import { ParsedGrantToken } from 'pubnub';
import { exists } from '../shared/helpers';

@binding([PubNubManager, AccessManagerKeyset])
class GrantTokenSteps {
  private pubnub?: PubNub;

  private token?: string;
  private parsedToken?: ParsedGrantToken;

  constructor(private manager: PubNubManager, private keyset: AccessManagerKeyset) {}

  @given('I have a keyset with access manager enabled')
  public useAccessManagerKeyset(): void {
    this.pubnub = this.manager.getInstance(this.keyset);
  }

  @given('I have a known token containing an authorized UUID')
  public useTokenWithKnownAuthorizedUUID() {
    this.token = tokenWithKnownAuthorizedUUID;
  }

  @given('I have a known token containing UUID resource permissions')
  public useTokenWithUUIDResourcePermissions() {
    this.token = tokenWithUUIDResourcePermissions;
  }

  @given('I have a known token containing UUID pattern Permissions')
  public useTokenWithUUIDPatternPermissions() {
    this.token = tokenWithUUIDPatternPermissions;
  }

  @when('I parse the token')
  public parseToken() {
    exists(this.token);
    exists(this.pubnub);

    this.parsedToken = this.pubnub.parseToken(this.token);

    expect(this.parsedToken).to.not.be.undefined;
  }

  private resourceName?: string;
  private resourceType?: ResourceType;

  @then('the token has {string} {resource_type} pattern access permissions')
  public withPatternAccessPermissions(name: string, type: ResourceType) {
    this.resourceName = name;
    this.resourceType = type;

    exists(this.parsedToken?.patterns?.[type]);
    exists(this.parsedToken?.patterns?.[type]?.[name]);
  }

  @then('token pattern permission {access_permission}')
  public hasAccessPermission(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    expect(this.parsedToken?.patterns?.[this.resourceType]?.[this.resourceName]?.[permission]).to.be.true;
  }
}

export = GrantTokenSteps;
