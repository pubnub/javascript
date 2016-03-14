/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import Networking from '../../../../../src/core/components/networking';
import PublishQueue from '../../../../../src/core/components/publish_queue';
import Responders from '../../../../../src/core/presenters/responders';

import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import loglevel from 'loglevel';

loglevel.disableAll();

describe('publish endpoints', () => {
  let publishQueue;
  let instance;
  let encryptStub;
  let validateResponderStub;
  let queueItemStub;
  let callbackStub;

  beforeEach(() => {
    publishQueue = new PublishQueue({ networking: new Networking() });
    encryptStub = sinon.stub().returnsArg(0);
    callbackStub = sinon.stub();
    validateResponderStub = sinon.stub().returns('validationError');
    queueItemStub = sinon.stub(publishQueue, 'queueItem');

    const respondersClass = Responders;
    respondersClass.prototype.validationError = validateResponderStub;

    const proxy = proxyquire('../../../../../src/core/endpoints/publish', {
      '../presenters/responders': respondersClass,
    }).default;

    instance = new proxy({ publishQueue, encrypt: encryptStub });
  });

  it('errors if message is not provided', () => {
    instance.publish({}, callbackStub);
    assert.equal(callbackStub.args[0][0], 'validationError');
    assert.equal(validateResponderStub.args[0][0], 'Missing Message');
  });

  it('errors if channel is not provided', () => {
    instance.publish({ message: 'hello!' }, callbackStub);
    assert.equal(callbackStub.args[0][0], 'validationError');
    assert.equal(validateResponderStub.args[0][0], 'Missing Channel');
  });

  it('uses encrypt method with cipher key passed', () => {
    instance.publish({ message: 'hello!', channel: 'ch1', cipherKey: 'cipherKey' }, callbackStub);
    assert.deepEqual(encryptStub.args[0], ['hello!', 'cipherKey']);
  });

  it('enqueues a message to be sent by the queue', () => {
    instance.publish({ message: 'hello!', channel: 'ch1' }, callbackStub);

    let publishItem = queueItemStub.args[0][0];

    assert.equal(publishItem.channel, 'ch1');
    assert.equal(publishItem.httpMethod, 'GET');
    assert.equal(publishItem.payload, '"hello!"');
    assert.deepEqual(publishItem.params, {});
    assert.deepEqual(publishItem.callback, callbackStub);
  });

  it('supports the do not store in history param', () => {
    instance.publish({ message: 'hello!', channel: 'ch1', storeInHistory: false }, callbackStub);

    let publishItem = queueItemStub.args[0][0];

    assert.equal(publishItem.channel, 'ch1');
    assert.equal(publishItem.httpMethod, 'GET');
    assert.equal(publishItem.payload, '"hello!"');
    assert.deepEqual(publishItem.params, { store: '0' });
    assert.deepEqual(publishItem.callback, callbackStub);
  });

  it('supports publishing with meta param', () => {
    instance.publish({ message: 'hello!', channel: 'ch1', sendByPost: true, meta: { this: 'meta' } }, callbackStub);

    let publishItem = queueItemStub.args[0][0];

    assert.equal(publishItem.channel, 'ch1');
    assert.equal(publishItem.httpMethod, 'POST');
    assert.equal(publishItem.payload, '"hello!"');
    assert.deepEqual(publishItem.params, { meta: '{\"this\":\"meta\"}' });
    assert.deepEqual(publishItem.callback, callbackStub);
  });

  it('supports publishing via POST', () => {
    instance.publish({ message: 'hello!', channel: 'ch1', sendByPost: true }, callbackStub);

    let publishItem = queueItemStub.args[0][0];

    assert.equal(publishItem.channel, 'ch1');
    assert.equal(publishItem.httpMethod, 'POST');
    assert.equal(publishItem.payload, '"hello!"');
    assert.deepEqual(publishItem.params, {});
    assert.deepEqual(publishItem.callback, callbackStub);
  });
});
