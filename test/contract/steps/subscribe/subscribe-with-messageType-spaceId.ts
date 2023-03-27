import { Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Then('response contains messages with {string} and {string} types', function (firstType, secondType) {
  const firstTypeMessageCount = this.events.filter((event) => event.type === firstType).length;
  expect(firstTypeMessageCount).to.equal(1);
  const secondTypeMessageCount = this.events.filter((event) => event.type === secondType).length;
  expect(secondTypeMessageCount).to.equal(1);
});

Then('response contains messages without space ids', function () {
  expect(this.events.filter((event) => typeof event.spaceId === 'string').length).to.equal(0);
});

Then('response contains messages with space ids', function () {
  expect(this.events.filter((event) => typeof event.spaceId === 'undefined').length).to.equal(0);
});

Then('I receive 2 messages in my subscribe response', function () {
  expect(this.events.length).to.equal(2);
});
