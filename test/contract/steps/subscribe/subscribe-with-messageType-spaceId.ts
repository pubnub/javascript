import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Then('subscribe response contains messages with {string} and {string} message types', function (firstType, secondType) {
  const firstTypeMessageCount = this.events.filter((event) => event.messageType === firstType).length;
  expect(firstTypeMessageCount).to.equal(1);
  const secondTypeMessageCount = this.events.filter((event) => event.messageType === secondType).length;
  expect(secondTypeMessageCount).to.equal(1);
});

Then('subscribe response contains messages without space ids', function () {
  expect(this.events.filter((event) => typeof event.spaceId === 'string').length).to.equal(0);
});

Then('subscribe response contains messages with space ids', function () {
  expect(this.events.filter((event) => typeof event.spaceId === 'undefined').length).to.equal(0);
});
