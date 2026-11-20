/**
 * Self-test of the marker lint: writes small broken files into a temporary directory outside the repository, lints them and
 * checks that each defect is reported (and that a clean file is not). `npx tsx test/integration/live/support/lint-selftest.ts`
 * Exit code 1 when a defect goes unreported.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { lintTier } from './lint-markers';
import { buildManifest } from './manifest';
import { scanTier } from './snippet-scan';

const GOOD = `import assert from 'node:assert/strict';
describe('d', () => {
  it('good: ok', async () => {
    // snippet.good
    const x = await Promise.resolve(1);
    // snippet.end
    assert.equal(x, 1);
  });
});
`;

const CASES: Array<{ name: string; source: string; expect: RegExp[] }> = [
  { name: 'clean', source: GOOD, expect: [] },
  {
    name: 'nested start, no end, hide without show, loose marker',
    source: `describe('d', () => { it('a', () => {
  // snippet.outer
  const a = 1;
  // snippet.inner
  const b = 2;
  // snippet.hide
  const c = 3;
  // snippet.end
  //snippet.nospace
  // snippet.bad.id
  // snippet.open
  const d = 4;
  assert.ok(a + b + c + d);
}); });`,
    expect: [
      /"inner" starts inside snippet "outer"/,
      /no snippet\.show/,
      /needs a space/,
      /characters outside/,
      /"open" has no snippet\.end/,
    ],
  },
  {
    name: 'hidden block too long, empty snippet',
    source: `describe('d', () => { it('a', () => {
  // snippet.big
  const a = 1;
  // snippet.hide
  const b = 1;
  const c = 1;
  const d = 1;
  const e = 1;
  // snippet.show
  // snippet.end
  // snippet.empty
  // snippet.end
  assert.ok(a);
}); });`,
    expect: [/hidden block in "big" has 4 lines/, /snippet "empty" is empty/],
  },
  {
    name: 'test-only code, try/catch, console.error, return',
    source: `import { observer } from '../support/clients';
import assert from 'node:assert/strict';
describe('d', () => { it('a', async () => {
  // snippet.dirty
  assert.ok(true);
  const p = observer();
  try { await p.time(); } catch (e) { console.error(e); }
  if (p) return;
  // snippet.end
  assert.ok(p);
}); });`,
    expect: [
      /test-only code .*`assert`/,
      /test-only code .*`observer`/,
      /try\/catch inside snippet "dirty"/,
      /console\.error inside snippet "dirty"/,
      /return inside snippet "dirty"/,
    ],
  },
  {
    name: 'no assertion after the snippet, assertion only before',
    source: `import assert from 'node:assert/strict';
describe('d', () => { it('late', async () => {
  assert.ok(true);
  // snippet.late
  const a = 1;
  // snippet.end
  console.log(a);
}); });`,
    expect: [/no assertion after snippet "late"/],
  },
  {
    name: 'top level non-import snippet, snippet outside any it, skipped test',
    source: `// snippet.topLevel
const a = 1;
// snippet.end
describe('d', () => { it.skip('s', () => {
  // snippet.skipped
  const b = 2;
  // snippet.end
  assert.ok(b);
}); });`,
    expect: [/"topLevel" is neither inside one it\(\)/, /sits in a skipped test/],
  },
  {
    name: 'escape comment: valid and invalid',
    source: `describe('d', () => { it('esc', async () => {
  // snippet.esc
  const a = 1;
  // snippet.end
  // lint: asserted-via checkIt
  await checkIt(a);
});
it('esc2', async () => {
  // snippet.esc2
  const a = 1;
  // snippet.end
  // lint: asserted-via neverCalled
}); });`,
    expect: [/"esc2"|asserted-via neverCalled/],
  },
  {
    name: 'asserted-by escape: valid is clean',
    source: `import fs from 'node:fs';
// snippet.fileLevel
import path from 'node:path';
function load() { return path.sep + fs.existsSync('x'); }
// snippet.end
// lint: asserted-by reads it back
describe('d', () => { it('fileLevel: reads it back', () => { assert.ok(load()); }); });`,
    expect: [],
  },
  {
    name: 'asserted-by escape: no match, ambiguous, no assertion, missing',
    source: `// snippet.noMatch
function a() { return 1; }
// snippet.end
// lint: asserted-by nothing like this
// snippet.ambiguous
function b() { return 1; }
// snippet.end
// lint: asserted-by same
// snippet.noAssert
function c() { return 1; }
// snippet.end
// lint: asserted-by quiet
// snippet.missing
function d() { return 1; }
// snippet.end

describe('d', () => {
  it('same one', () => { assert.ok(a()); });
  it('same two', () => { assert.ok(b()); });
  it('quiet test', () => { c(); });
});`,
    expect: [
      /asserted-by nothing like this.* matches 0/,
      /asserted-by same.* matches 2/,
      /asserted-by quiet.*has no assertion call/,
      /"missing" is neither inside one it\(\)/,
    ],
  },
  {
    name: 'helper called by it, no assertion',
    source: `describe('d', () => {
  const run = async (): Promise<number> => {
    // snippet.helperSnippet
    const a = 1;
    // snippet.end
    return a;
  };
  it('h', async () => { await run(); });
});`,
    expect: [/runs in helper run\(\) but no assertion follows/],
  },
  {
    name: 'slash id is a warning only',
    source: GOOD.replace('snippet.good', 'snippet.good/2'),
    expect: [],
  },
];

let failed = 0;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-lint-selftest-'));
try {
  for (const c of CASES) {
    const abs = path.join(dir, `${c.name.replace(/\W+/g, '-')}.test.ts`);
    fs.writeFileSync(abs, c.source);
    const result = lintTier(scanTier([{ abs, kind: 'test' }]));
    const messages = result.errors.map((e) => `${e.line}: ${e.message}`);
    const missing = c.expect.filter((re) => !messages.some((m) => re.test(m)));
    const unexpected = c.expect.length === 0 && result.errors.length > 0;
    const warned = c.name.startsWith('slash') ? result.warnings.some((w) => /contains "\/"/.test(w.message)) : true;
    if (missing.length > 0 || unexpected || !warned) {
      failed += 1;
      console.error(
        `FAIL ${c.name}: missing ${missing.map(String).join(' ')} ${unexpected ? `unexpected: ${messages.join(' | ')}` : ''} ${warned ? '' : 'no slash warning'}`,
      );
    } else console.log(`ok   ${c.name} (${result.errors.length} finding(s))`);
  }
  // Cross-file duplicate.
  const a = path.join(dir, 'dup-a.test.ts');
  const b = path.join(dir, 'dup-b.test.ts');
  fs.writeFileSync(a, GOOD);
  fs.writeFileSync(b, GOOD);
  const dup = lintTier(
    scanTier([
      { abs: a, kind: 'test' },
      { abs: b, kind: 'test' },
    ]),
  );
  if (dup.errors.some((e) => /duplicate snippet id "good"/.test(e.message)))
    console.log('ok   duplicate id across files');
  else {
    failed += 1;
    console.error('FAIL duplicate id across files');
  }
  // The valid escape is recorded as live with the named test.
  const e = path.join(dir, 'escape.test.ts');
  fs.writeFileSync(e, CASES.find((c) => c.name === 'asserted-by escape: valid is clean')!.source);
  const esc = buildManifest(scanTier([{ abs: e, kind: 'test' }])).manifest.snippets.fileLevel;
  if (esc?.mode === 'live' && esc.test === 'd fileLevel: reads it back')
    console.log('ok   asserted-by is recorded as live with the test title');
  else {
    failed += 1;
    console.error(`FAIL asserted-by manifest entry: ${JSON.stringify(esc)}`);
  }
  // A file of the mocked allow-list: same rules, mode mocked.
  const m = path.join(dir, 'mocked.test.ts');
  fs.writeFileSync(m, GOOD);
  const mocked = buildManifest(scanTier([{ abs: m, kind: 'mocked' }])).manifest.snippets.good;
  if (mocked?.mode === 'mocked' && mocked.test === 'd good: ok') console.log('ok   mocked mode and full test title');
  else {
    failed += 1;
    console.error(`FAIL mocked mode: ${JSON.stringify(mocked)}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(failed === 0 ? 'lint self-test passed' : `lint self-test FAILED (${failed})`);
process.exitCode = failed === 0 ? 0 : 1;
