import { binding, given, then, when } from 'cucumber-tsflow';
import { expect } from 'chai';

import { AccessManagerKeyset } from '../shared/keysets';
import { PubNub, PubNubManager } from '../shared/pubnub';
import { tokenWithUUIDPatternPermissions } from '../shared/fixtures';
import { ResourceType, AccessPermission } from '../shared/enums';

import { ParsedGrantToken } from 'pubnub';

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

  // Given('I have a known token containing an authorized UUID', function () {
  //   this.token = this.fixtures.tokenWithKnownAuthorizedUUID;
  // });

  // Given('I have a known token containing UUID resource permissions', function () {
  //   this.token = this.fixtures.tokenWithUUIDResourcePermissions;
  // });

  @given('I have a known token containing UUID pattern Permissions')
  public useTokenWithUUIDPatternPermissions() {
    this.token = tokenWithUUIDPatternPermissions;
  }

  @when('I parse the token')
  public parseToken() {
    expect(this.token).to.exist;
    expect(this.pubnub).to.exist;

    this.parsedToken = this.pubnub!.parseToken(this.token!);

    expect(this.parsedToken).to.not.be.undefined;
  }

  private resourceName?: string;
  private resourceType?: ResourceType;

  @then('the token has {string} {resource_type} pattern access permissions')
  public withPatternAccessPermissions(name: string, type: ResourceType) {
    this.resourceName = name;
    this.resourceType = type;

    expect(this.parsedToken?.patterns?.[type]).to.exist;
    expect(this.parsedToken?.patterns?.[type]?.[name]).to.exist;
  }

  @then('token pattern permission {access_permission}')
  public hasAccessPermission(permission: AccessPermission) {
    expect(this.resourceType).to.exist;
    expect(this.resourceName).to.exist;

    expect(this.parsedToken?.patterns?.[this.resourceType!]?.[this.resourceName!]?.[permission]).to.be.true;
  }
}

export = GrantTokenSteps;
