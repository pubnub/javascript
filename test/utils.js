import nock from 'nock';

module.exports = {
  createNock() {
    return nock('http://ps.pndsn.com:80', {
      filteringScope: () => true
    });
  }
};
