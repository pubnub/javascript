/* @flow */

import Networking from '../components/networking';

type timeConstruct = {
  networking: Networking,
};

export default class {

  _networking: Networking;

  constructor({ networking}: timeConstruct) {
    this._networking = networking;
  }

  fetch(callback: Function) {
    this._networking.fetchTime((err, response) => {
      if (err) return callback(err);
      callback(null, response[0]);
    });
  }
}
