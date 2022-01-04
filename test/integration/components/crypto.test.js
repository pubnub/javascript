/** @flow */

import PubNub from '../../../src/node';

describe('components/crypto useRandomIVs', () => {
  const pubnub = new PubNub({
    subscribeKey: 'demo-36',
    publishKey: 'demo-36',
    useRandomIVs: true,
    cipherKey: 'abcdef',
    uuid: 'myUUID'
  });

  it('should be able to encrypt and decrypt a message', () => {
    const data = {
      message:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    };
    const plaintext = JSON.stringify(data);
    const ciphertext = pubnub.encrypt(plaintext);

    const decrypted = pubnub.decrypt(ciphertext);

    expect(decrypted).to.deep.equal(data);
  });
});
