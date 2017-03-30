/* @flow */
/* global localStorage */

export default {
  get(key: string) {
    // try catch for operating within iframes which disable localStorage
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(key: string, data: any) {
    // try catch for operating within iframes which disable localStorage
    try {
      return localStorage.setItem(key, data);
    } catch (e) {
      return null;
    }
  }
};
