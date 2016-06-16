import nock from 'nock';

module.exports = {
  createNock() {
    return nock('http://ps.pubnub.com:80', {
      filteringScope: () => true
    });
  }
};
