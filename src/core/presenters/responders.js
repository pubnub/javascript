/* @flow */

import _pick from 'lodash/pick';

export default class {

  _componentName: string;

  constructors(componenetName: string) {
    this._componentName = componenetName;
  }

  callback(response: Object, callback: Function) {
    if (typeof response === 'object') {
      if (response.error) {
        this.error(response, callback);
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

  error(response: Object, callback: Function) {
    if (typeof response === 'object' && response.error) {
      let preparedData = _pick(response, ['message', 'payload']);
      return this._createError(callback, preparedData, 'httpResultError');
    } else {
      return this._createError(callback, { message: response }, 'httpResultError');
    }
  }

  validationError(callback: Function, message: string) {
    this._createError(callback, { message }, 'validationError');
  }

  _createError(callback: Function, errorPayload: Object, type: string) {
    errorPayload.component = this._componentName;
    errorPayload.type = type;
    callback(1, errorPayload);
  }

}
