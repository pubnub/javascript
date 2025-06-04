/* global describe, it */

import { expect } from 'chai';
import {
  adjustedTimetokenBy,
  referenceSubscribeTimetoken,
  subscriptionTimetokenFromReference,
} from '../../src/core/utils';

describe('timetoken utilities', () => {
  let originalNow: () => number;

  before(() => {
    originalNow = Date.now;
  });

  after(() => {
    Date.now = originalNow;
  });

  describe('adjustedTimetokenBy', () => {
    it('adds small tick values when seconds are zero', () => {
      const result = adjustedTimetokenBy('17457898563376757', '20', true);
      expect(result).to.equal('17457898563376777');
    });

    it('subtracts small tick values when seconds are zero', () => {
      const result = adjustedTimetokenBy('17457898586671016', '20', false);
      expect(result).to.equal('17457898586670996');
    });

    it('carries overflow into seconds correctly', () => {
      const result = adjustedTimetokenBy('17457898612467575', '1000000', true);
      expect(result).to.equal('17457898613467575');
    });

    it('borrows one second on underflow when seconds > 0', () => {
      const result = adjustedTimetokenBy('17457898692039206', '3000000', false);
      expect(result).to.equal('17457898689039206');
    });

    it('produces negative ticks when underflow and no seconds to borrow', () => {
      const result = adjustedTimetokenBy('17457898706275755', '17457898706279755', false);
      expect(result).to.equal('-4000');
    });

    it('handles multi-second increments correctly', () => {
      const result = adjustedTimetokenBy('17457898710975097', '15000000', true);
      expect(result).to.equal('17457898725975097');
    });
  });

  describe('referenceSubscribeTimetoken', () => {
    it('returns undefined when service timetoken is missing or empty', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(referenceSubscribeTimetoken(undefined, '17457898692039206', '17457898710975097')).to.be.undefined;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(referenceSubscribeTimetoken('', '17457898692039206', '17457898710975097')).to.be.undefined;
    });

    it('return machines unixtimestamp adjusted to the older catchup timetoken', () => {
      Date.now = () => 1745789872627;
      // Difference between service recent response and catchup timetoken (from the past).
      const serviceCatchUpDiff = 40000;
      const result = referenceSubscribeTimetoken('17457898692039206', '17457898292039206', null);
      expect(result).to.equal(`${Date.now() - serviceCatchUpDiff}0000`);
    });

    // Testing the code but in the real world users won't provide catchup timetoken from the future.
    it('return machines unixtimestamp adjusted to the newer catchup timetoken', () => {
      Date.now = () => 1745789870627;
      // Difference between service recent response and catchup timetoken (from the past).
      const serviceCatchUpDiff = -30000;
      const result = referenceSubscribeTimetoken('17457898692039206', '17457898992039206', null);
      expect(result).to.equal(`${Date.now() - serviceCatchUpDiff}0000`);
    });

    it('returns existing reference when catchUp is absent but reference provided', () => {
      const existing = '17457898992039206';
      const result = referenceSubscribeTimetoken('17457898692039206', undefined, existing);
      expect(result).to.equal(existing);
    });

    it('returns adjusted reference when older catchup timetoken', () => {
      const existing = '17457898722039206';
      // Difference between service recent response and catchup timetoken (from the past).
      const serviceCatchUpDiff = 50000;
      const result = referenceSubscribeTimetoken('17457898692039206', '17457898691989206', existing);
      expect(result).to.equal('17457898721989206');
    });

    it('returns adjusted reference when newer catchup timetoken', () => {
      const existing = '17457898722039206';
      // Difference between service recent response and catchup timetoken (from the past).
      const serviceCatchUpDiff = -20000;
      const result = referenceSubscribeTimetoken('17457898692039206', '17457898692059206', existing);
      expect(result).to.equal('17457898722059206');
    });

    it('falls back to Date.now when no catchUp or reference provided', () => {
      Date.now = () => 1745789870627;
      const result = referenceSubscribeTimetoken('17457898692039206');
      expect(result).to.equal('17457898706270000');
    });
  });

  describe('subscriptionTimetokenFromReference', () => {
    it('returns undefined when reference timetoken is missing or zero', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(subscriptionTimetokenFromReference('17457898887210343', '0')).to.be.undefined;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(subscriptionTimetokenFromReference('0', '17457899266888969')).to.be.undefined;
    });

    it('returns a non-empty string for valid inputs', () => {
      const existing = 1745789870627;
      Date.now = () => existing + 18657;
      // Difference between local unixtimestamp and previous reference timetoken (from the past).
      const referenceDiff = Date.now() - existing; // 18657
      const result = subscriptionTimetokenFromReference('17457900587813122', `${1745789870627}0000`);
      expect(result).to.equal('17457900774383122');
    });
  });
});
