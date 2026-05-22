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
 * Convert `set` and `remove` parameters to JSON Patch operations (wire format).
 *
 * - Each key in `set` becomes a "replace" operation.
 * - Each entry in `remove` becomes a "remove" operation.
 *
 * @internal
 */
function toJsonPatchOperations(set, remove) {
    const ops = [];
    if (set) {
        for (const [dotPath, value] of Object.entries(set)) {
            ops.push({ op: 'add', path: toJsonPointer(dotPath), value });
        }
    }
    if (remove) {
        for (const dotPath of remove) {
            ops.push({ op: 'remove', path: toJsonPointer(dotPath) });
        }
    }
    return ops;
}
