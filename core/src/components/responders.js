/* @flow */

import _pick from 'lodash/pick';

export default class {
  static callback(response, callback, err) {
    if (typeof response === 'object') {
      if (response.error) {
        let preparedData = _pick(response, ['message', 'payload']);
        if (err) err(preparedData);
        return;
      }
      if (response.payload) {
        if (response.next_page) {
          if (callback) callback(response.payload, response.next_page);
        } else {
          if (callback) callback(response.payload);
        }
        return;
      }
    }
    if (callback) callback(response);
  }

  static error(response, err) {
    if (typeof response === 'object' && response.error) {
      let preparedData = _pick(response, ['message', 'payload']);
      if (err) return err(preparedData);
    } else {
      if (err) return err(response);
    }
  }
}
