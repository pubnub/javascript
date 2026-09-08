/**
 * Unit tests for the DataSync JSON Patch conversion helpers (pure logic).
 *
 * `toJsonPatchOperations` maps the SDK's user-friendly input to RFC 6902 operations on the wire
 * (op ∈ add | remove | replace | move | copy | test).
 *
 */

import assert from 'assert';

import { toJsonPatchOperations } from '../../../src/core/types/api/data-sync';

describe('DataSync JSON Patch conversion', () => {
  describe('toJsonPatchOperations', () => {
    it('maps add / replace / remove', () => {
      const ops = toJsonPatchOperations({
        add: { '/payload/phone': '+15550100' },
        replace: { '/payload/creditScore': 810 },
        remove: ['/payload/city'],
      });

      assert.deepStrictEqual(ops, [
        { op: 'add', path: '/payload/phone', value: '+15550100' },
        { op: 'replace', path: '/payload/creditScore', value: 810 },
        { op: 'remove', path: '/payload/city' },
      ]);
    });

    it('maps move with a `from` pointer', () => {
      const ops = toJsonPatchOperations({
        move: [{ from: '/payload/legacyName', path: '/payload/displayName' }],
      });

      assert.deepStrictEqual(ops, [{ op: 'move', from: '/payload/legacyName', path: '/payload/displayName' }]);
    });

    it('maps copy with a `from` pointer', () => {
      const ops = toJsonPatchOperations({
        copy: [{ from: '/payload/displayName', path: '/payload/previousName' }],
      });

      assert.deepStrictEqual(ops, [{ op: 'copy', from: '/payload/displayName', path: '/payload/previousName' }]);
    });

    it('maps test with an expected value', () => {
      const ops = toJsonPatchOperations({ test: { '/payload/status': 'active' } });

      assert.deepStrictEqual(ops, [{ op: 'test', path: '/payload/status', value: 'active' }]);
    });

    it('passes paths through verbatim — no `.` → `/` translation, no leading `/` added', () => {
      const ops = toJsonPatchOperations({
        add: { '/payload/user.name': 'Alice' },
        replace: { '/payload/config.ttlSec': 60 },
        remove: ['/payload/a.b.c'],
        move: [{ from: '/payload/legacy.name', path: '/payload/display.name' }],
        copy: [{ from: '/payload/display.name', path: '/payload/previous.name' }],
        test: { 'payload.status': 'active' },
      });

      assert.deepStrictEqual(ops, [
        // A `.` inside a segment addresses the literal stored key `user.name`.
        { op: 'add', path: '/payload/user.name', value: 'Alice' },
        { op: 'replace', path: '/payload/config.ttlSec', value: 60 },
        { op: 'remove', path: '/payload/a.b.c' },
        { op: 'move', from: '/payload/legacy.name', path: '/payload/display.name' },
        { op: 'copy', from: '/payload/display.name', path: '/payload/previous.name' },
        // Dot notation is no longer interpreted: it goes out exactly as written (no leading `/`).
        { op: 'test', path: 'payload.status', value: 'active' },
      ]);
    });

    it('emits operations in a stable order: add, replace, remove, move, copy, test', () => {
      const ops = toJsonPatchOperations({
        add: { '/a': 1 },
        replace: { '/b': 2 },
        remove: ['/c'],
        move: [{ from: '/d', path: '/e' }],
        copy: [{ from: '/f', path: '/g' }],
        test: { '/h': 3 },
      });

      assert.deepStrictEqual(
        ops.map((o) => o.op),
        ['add', 'replace', 'remove', 'move', 'copy', 'test'],
      );
    });

    it('returns an empty array when nothing is provided', () => {
      assert.deepStrictEqual(toJsonPatchOperations({}), []);
    });
  });
});
