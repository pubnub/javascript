"use strict";
/**
 * PubNub DataSync API type definitions.
 *
 * Types for Entity Class CRUD operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDataSyncSort = serializeDataSyncSort;
exports.toJsonPointer = toJsonPointer;
exports.toJsonPatchOperations = toJsonPatchOperations;
/**
 * Serialize a {@link DataSyncSort} into the query value the service expects.
 *
 * A raw string is passed through unchanged. An object is turned into a list of `field:order`
 * entries (a `null` direction emits the bare field name, letting the service apply its default
 * ascending order). Mirrors the App Context `getAllChannelMetadata` sort handling.
 *
 * @internal
 */
function serializeDataSyncSort(sort) {
    if (typeof sort === 'string')
        return sort;
    return Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(([option, order]) => (order !== null ? `${option}:${order}` : option));
}
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
 * Convert user-friendly dot-notation patch input to JSON Patch operations (wire format).
 *
 * - Each key in `add` becomes an "add" operation.
 * - Each key in `replace` becomes a "replace" operation.
 * - Each entry in `remove` becomes a "remove" operation.
 * - Each `{ from, path }` pair in `move` becomes a "move" operation.
 * - Each `{ from, path }` pair in `copy` becomes a "copy" operation.
 * - Each key in `test` becomes a "test" operation.
 *
 * @internal
 */
function toJsonPatchOperations(input) {
    const { add, replace, remove, move, copy, test } = input;
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
    if (move) {
        for (const { from, path } of move) {
            ops.push({ op: 'move', from: toJsonPointer(from), path: toJsonPointer(path) });
        }
    }
    if (copy) {
        for (const { from, path } of copy) {
            ops.push({ op: 'copy', from: toJsonPointer(from), path: toJsonPointer(path) });
        }
    }
    if (test) {
        for (const [dotPath, value] of Object.entries(test)) {
            ops.push({ op: 'test', path: toJsonPointer(dotPath), value });
        }
    }
    return ops;
}
