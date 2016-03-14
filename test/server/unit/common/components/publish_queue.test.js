/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import PublishQueue from '../../../../../src/core/components/publish_queue';

const assert = require('assert');
const sinon = require('sinon');

describe('#components/publishing_queue', () => {
  let networking;

  beforeEach(() => {
    networking = new Networking({});
  });

  it('calls to sendNext when a new item is inserted', () => {
    let publishQueue = new PublishQueue({ networking });
    let sendNextStub = sinon.stub(publishQueue, '_sendNext');
    let queueable = publishQueue.newQueueable();
    queueable.channel = 'ma-channel';

    publishQueue.queueItem(queueable);
    assert.equal(sendNextStub.callCount, 1);
    assert.equal(publishQueue._publishQueue.length, 1);
  });

  describe('sendNext', () => {
    it('does not call publisher if the queue is empty', () => {
      let publishQueue = new PublishQueue({ networking });
      let publisherStub = sinon.stub(publishQueue, '__publishNext');
      publishQueue._sendNext();
      assert.equal(publisherStub.callCount, 0);
    });

    it('does not call publisher if something is already in flight', () => {
      let publishQueue = new PublishQueue({ networking });
      let publisherStub = sinon.stub(publishQueue, '__publishNext');

      let queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel';
      publishQueue._isSending = true;
      publishQueue.queueItem(queueable);
      assert.equal(publisherStub.callCount, 0);
    });

    it('sets the sending status and delgates to publisher', () => {
      let publishQueue = new PublishQueue({ networking });
      let publisherStub = sinon.stub(publishQueue, '__publishNext');

      let queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel';
      publishQueue.queueItem(queueable);
      assert.equal(publisherStub.callCount, 1);
      assert.equal(publishQueue._isSending, true);
    });

    it('multiple publishes get queued', () => {
      let publishQueue = new PublishQueue({ networking });
      let publisherStub = sinon.stub(publishQueue, '__publishNext');

      let queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel';
      publishQueue.queueItem(queueable);
      queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel2';
      publishQueue.queueItem(queueable);
      assert.equal(publisherStub.callCount, 1);
      assert.equal(publishQueue._isSending, true);
    });

    it('on parallel mode, it executes the publish without waiting', () => {
      let publishQueue = new PublishQueue({ networking, parallelPublish: true });
      let publisherStub = sinon.stub(publishQueue, '__publishNext');

      let queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel';
      publishQueue.queueItem(queueable);
      queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel2';
      publishQueue.queueItem(queueable);
      assert.equal(publisherStub.callCount, 2);
    });
  });

  describe('#__publishNext', () => {
    let networkingStub;
    let callbackStub;
    let publishQueue;
    let sendNextStub;

    beforeEach(() => {
      callbackStub = sinon.stub();
      networkingStub = sinon.stub(networking, 'performPublish');

      publishQueue = new PublishQueue({ networking });

      let queueable = publishQueue.newQueueable();
      queueable.channel = 'ma-channel';
      queueable.callback = callbackStub;
      queueable.params = { my: 'params' };
      queueable.httpMethod = 'httpMethod';
      queueable.payload = 'payload';
      publishQueue.queueItem(queueable);
    });

    it('passes correct param to the networking function', () => {
      assert.equal(networkingStub.args[0][0], 'ma-channel');
      assert.equal(networkingStub.args[0][1], 'payload');
      assert.deepEqual(networkingStub.args[0][2], { my: 'params' });
      assert.equal(networkingStub.args[0][3], 'httpMethod');
    });

    it('calls #sendNext to process the next item', () => {
      sendNextStub = sinon.stub(publishQueue, '_sendNext');
      networkingStub.args[0][4]('error', 'response');
      assert.equal(sendNextStub.callCount, 1);
    });

    it('sets isSending to false to process the next item', () => {
      sendNextStub = sinon.stub(publishQueue, '_sendNext');
      networkingStub.args[0][4]('error', 'response');
      assert.equal(publishQueue._isSending, false);
    });

    it('passes arguments to the callback function', () => {
      sendNextStub = sinon.stub(publishQueue, '_sendNext');
      networkingStub.args[0][4]('error', 'response');
      assert.deepEqual(callbackStub.args[0], ['error', 'response']);
    });
  });
});
