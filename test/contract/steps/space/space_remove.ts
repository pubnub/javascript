import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

When('I remove the space', async function() {
  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  let result = await pubnub.removeSpace({
    spaceId: this.spaceId
  });
  expect(result.status).to.equal(200);
  this.space = result.data;
});

Then('I get a null space', async function() {
  expect(this.space).to.be.null;
});

When('I attempt to fetch the space {string}', async function(spaceId) {
  // ensure we fetch the existing specified space id
  expect(spaceId).to.equal(this.spaceId);

  let pubnub = this.getPubnub({
    publishKey: this.keyset.publishKey,
    subscribeKey: this.keyset.subscribeKey
  });

  try {
    let result = await pubnub.fetchSpace({
      spaceId: spaceId
    });
    
    this.removeStatus = result.status;
  } catch (e: any) {
    this.errorMessage = e.message;
  }
});

Then('I get get a space not found error', async function() {
  expect(this.errorMessage).to.equal('PubNub call failed, check status for details');
});
