/* eslint-disable @typescript-eslint/no-non-null-assertion */
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

import { ParsedGrantToken, GrantTokenParameters } from 'pubnub';
import { exists } from '../shared/helpers';

@binding([PubNubManager, AccessManagerKeyset])
class GrantTokenSteps {
  private pubnub?: PubNub;

  private token?: string;
  private parsedToken?: ParsedGrantToken;

  private grantParams: Partial<GrantTokenParameters> = {};

  private resourceName?: string;
  private resourceType?: ResourceType;

  constructor(
    private manager: PubNubManager,
    private keyset: AccessManagerKeyset,
  ) {}

  @given('the authorized UUID {string}')
  public givenAuthorizedUUID(authorizedUUID: string) {
    this.grantParams.authorized_uuid = authorizedUUID;
  }

  @given('the TTL {int}')
  public givenTTL(ttl: number) {
    this.grantParams.ttl = ttl;
  }

  @given('the {string} {resource_type} resource access permissions')
  public givenResourceAccess(name: string, type: ResourceType) {
    this.resourceType = type;
    this.resourceName = name;

    this.grantParams.resources = {
      ...(this.grantParams.resources ?? {}),
      [type]: {
        ...(this.grantParams.resources?.[type] ?? {}),
        [name]: {},
      },
    };
  }

  @given('the {string} {resource_type} pattern access permissions')
  public givenPatternAccess(name: string, type: ResourceType) {
    this.resourceType = type;
    this.resourceName = name;

    this.grantParams.patterns = {
      ...(this.grantParams.patterns ?? {}),
      [type]: {
        ...(this.grantParams.patterns?.[type] ?? {}),
        [name]: {},
      },
    };
  }

  @given('grant resource permission {access_permission}')
  public givenGrantResourceAccessPermissions(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    exists(this.grantParams.resources?.[this.resourceType]?.[this.resourceName]);

    this.grantParams.resources[this.resourceType]![this.resourceName][permission] = true;
  }

  @given('deny resource permission {access_permission}')
  public givenDenyResourceAccessPermissions(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    exists(this.grantParams.resources?.[this.resourceType]?.[this.resourceName]);

    this.grantParams.resources[this.resourceType]![this.resourceName][permission] = false;
  }

  @given('grant pattern permission {access_permission}')
  public givenGrantPatternAccessPermissions(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    exists(this.grantParams.patterns?.[this.resourceType]?.[this.resourceName]);

    this.grantParams.patterns[this.resourceType]![this.resourceName][permission] = true;
  }

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

  @when('I grant a token specifying those permissions')
  public async grantToken() {
    exists(this.grantParams);

    const params = this.grantParams as GrantTokenParameters;

    const token = await this.pubnub?.grantToken(params);

    exists(token);

    this.token = token;
    this.parsedToken = this.pubnub?.parseToken(token);
  }

  @then('the token has {string} {resource_type} pattern access permissions')
  public withPatternAccessPermissions(name: string, type: ResourceType) {
    this.resourceName = name;
    this.resourceType = type;

    exists(this.parsedToken?.patterns?.[type]);
    exists(this.parsedToken?.patterns?.[type]?.[name]);
  }

  @then('token pattern permission {access_permission}')
  public hasPatternAccessPermission(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    expect(this.parsedToken?.patterns?.[this.resourceType]?.[this.resourceName]?.[permission]).to.be.true;
  }

  @then('the token has {string} {resource_type} resource access permissions')
  public withResourceAccessPermissions(name: string, type: ResourceType) {
    this.resourceName = name;
    this.resourceType = type;

    exists(this.parsedToken?.resources?.[type]);
    exists(this.parsedToken?.resources?.[type]?.[name]);
  }

  @then('token resource permission {access_permission}')
  public hasResourceAccessPermission(permission: AccessPermission) {
    exists(this.resourceType);
    exists(this.resourceName);

    expect(this.parsedToken?.resources?.[this.resourceType]?.[this.resourceName]?.[permission]).to.be.true;
  }

  @then('(the )token contains (the )TTL {int}')
  public hasTTL(ttl: number) {
    expect(this.parsedToken?.ttl).to.equal(ttl);
  }

  @then('(the )token contains (the )authorized UUID {string}')
  public hasAuthorizedUUID(authorizedUUID: string) {
    expect(this.parsedToken?.authorized_uuid).to.equal(authorizedUUID);
  }

  @then('the token does not contain an authorized uuid')
  public doesntHaveAuthorizedUUID() {
    expect(this.parsedToken?.authorized_uuid).to.be.undefined;
  }
}

export = GrantTokenSteps;
