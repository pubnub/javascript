"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lil_uuid_1 = __importDefault(require("lil-uuid"));
exports.default = {
    createUUID() {
        if (lil_uuid_1.default.uuid) {
            return lil_uuid_1.default.uuid();
        }
        // @ts-expect-error Depending on module type it may be callable.
        return (0, lil_uuid_1.default)();
    },
};
