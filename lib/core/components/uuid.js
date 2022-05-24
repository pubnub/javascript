"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lil_uuid_1 = __importDefault(require("lil-uuid"));
exports.default = {
    createUUID: function () {
        if (lil_uuid_1.default.uuid) {
            return lil_uuid_1.default.uuid();
        }
        return (0, lil_uuid_1.default)();
    },
};
