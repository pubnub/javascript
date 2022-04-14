"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lil_uuid_1 = require("lil-uuid");
exports.default = {
    createUUID: function () {
        if (lil_uuid_1.default.uuid) {
            return lil_uuid_1.default.uuid();
        }
        return (0, lil_uuid_1.default)();
    },
};
