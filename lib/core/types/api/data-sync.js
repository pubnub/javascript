"use strict";
/**
 * PubNub DataSync API type definitions.
 *
 * Types for Entity Class CRUD operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJsonPointer = toJsonPointer;
exports.toJsonPatchOperations = toJsonPatchOperations;
/**
 * Convert dot-notation path to JSON Pointer (RFC 6901).
 *
 * "config.ttlSec"           → "/config/ttlSec"
 * "filterableFields.0.name" → "/filterableFields/0/name"
 *
 * @internal
 */
function toJsonPointer(dotPath) {
    return '/' + dotPath.split('.').join('/');
}
/**
 * Convert `add`, `replace`, and `remove` parameters to JSON Patch operations (wire format).
 *
 * - Each key in `add` becomes an "add" operation.
 * - Each key in `replace` becomes a "replace" operation.
 * - Each entry in `remove` becomes a "remove" operation.
 *
 * @internal
 */
function toJsonPatchOperations(add, replace, remove) {
    const ops = [];
    if (add) {
        for (const [dotPath, value] of Object.entries(add)) {
            ops.push({ op: 'add', path: toJsonPointer(dotPath), value });
        }
    }
    if (replace) {
        for (const [dotPath, value] of Object.entries(replace)) {
            ops.push({ op: 'replace', path: toJsonPointer(dotPath), value });
        }
    }
    if (remove) {
        for (const dotPath of remove) {
            ops.push({ op: 'remove', path: toJsonPointer(dotPath) });
        }
    }
    return ops;
}
