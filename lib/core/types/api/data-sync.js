"use strict";
/**
 * PubNub DataSync API type definitions.
 *
 * Types for Entity Class CRUD operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDataSyncSort = serializeDataSyncSort;
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
 * Convert user-friendly patch input to JSON Patch operations (request format).
 *
 * `path`/`from` are passed through verbatim — callers supply the exact RFC 6901 pointer. Do not
 * reintroduce dot-notation translation here: splitting on `.` makes stored field names that
 * contain a `.` unaddressable.
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
        for (const [path, value] of Object.entries(add)) {
            ops.push({ op: 'add', path, value });
        }
    }
    if (replace) {
        for (const [path, value] of Object.entries(replace)) {
            ops.push({ op: 'replace', path, value });
        }
    }
    if (remove) {
        for (const path of remove) {
            ops.push({ op: 'remove', path });
        }
    }
    if (move) {
        for (const { from, path } of move) {
            ops.push({ op: 'move', from, path });
        }
    }
    if (copy) {
        for (const { from, path } of copy) {
            ops.push({ op: 'copy', from, path });
        }
    }
    if (test) {
        for (const [path, value] of Object.entries(test)) {
            ops.push({ op: 'test', path, value });
        }
    }
    return ops;
}
