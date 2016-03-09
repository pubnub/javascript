var _ = require('lodash');

function getRandom(max) {
  return Math.floor((Math.random() * (max || 1000000000) + 1));
}

function getTestUUID() {
  if (_.includes(['playback', 'cache'], process.env.VCR_MODE)) {
    return 'dd6af454-fa7a-47be-a800-1b9b050f5d94';
  } else {
    return require('node-uuid').v4();
  }
}

function getChannelPostFix() {
  if (_.includes(['playback', 'cache'], process.env.VCR_MODE)) {
    return 10;
  } else {
    return getRandom();
  }
}

module.exports = { getTestUUID: getTestUUID, getChannelPostFix: getChannelPostFix, getRandom: getRandom };
