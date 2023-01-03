"use strict";
/*       */
/* global localStorage */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    get: function (key) {
        // try catch for operating within iframes which disable localStorage
        try {
            return localStorage.getItem(key);
        }
        catch (e) {
            return null;
        }
    },
    set: function (key, data) {
        // try catch for operating within iframes which disable localStorage
        try {
            return localStorage.setItem(key, data);
        }
        catch (e) {
            return null;
        }
    },
};
