import { binding, given, then, when } from 'cucumber-tsflow';
import { expect } from 'chai';

import { AccessManagerKeyset } from '../shared/keysets';
import { PubNub, PubNubManager } from '../shared/pubnub';

import { exists } from '../shared/helpers';

@binding([PubNubManager, AccessManagerKeyset])
class AuthSteps {
  private pubnub?: PubNub;

  private token?: string;

  constructor(
    private manager: PubNubManager,
    private keyset: AccessManagerKeyset,
  ) {}

  @when('I publish a message using that auth token with channel {string}')
  public publishMessage() {
    exists(this.token);
    exists(this.pubnub);
  }
}

export = AuthSteps;
