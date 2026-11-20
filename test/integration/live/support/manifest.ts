/**
 * Coverage manifest of the live tier: `test/integration/live/coverage.json`, generated, one entry per snippet id.
 *
 *   npm run test:integration:live:manifest           writes coverage.json
 *   npm run test:integration:live:manifest -- --check   fails when coverage.json is stale (used by the lint script)
 *
 * mode:
 *   live          the snippet sits inside an it() of the live tier (or in a helper such an it() calls)
 *   compile-only  import-only snippet at the top of a test file: type-checked and loaded with the file, not run as an API call
 *   mocked        the snippet sits inside an it() of a nock-mocked test listed in MOCKED_FILES (snippet-scan.ts)
 * `files` lists whole-file samples the docs embed without snippet ids (for example quickstart-node.mjs) that a test runs.
 * Things the docs embed that are deliberately not run are in snippet-exceptions.json (hand maintained).
 */
import fs from 'node:fs';
import path from 'node:path';
import { LIVE_DIR, scanTier, type Mode, type TierScan } from './snippet-scan';

export const COVERAGE_FILE = path.join(LIVE_DIR, 'coverage.json');
export const EXCEPTIONS_FILE = path.join(LIVE_DIR, 'snippet-exceptions.json');

export interface SnippetEntry {
  /** Repository relative path of the file that holds the markers. */
  file: string;
  /** Full Mocha title (describe + it) of the test that runs it. Absent for compile-only. */
  test?: string;
  /** Keyset roles the test uses, derived from createClient/keysOf/server calls (heuristic). Absent when not derivable. */
  role?: string;
  mode: Mode;
}

export interface FileEntry {
  mode: 'live';
  test: string;
  testFile: string;
}

export interface Manifest {
  $comment: string;
  snippets: Record<string, SnippetEntry>;
  files: Record<string, FileEntry>;
}

export interface ExceptionEntry {
  /** Docs-facing path, as in the EmbeddedCode url (for example test/integration/live/quickstarts/quickstart-web.ts). */
  path: string;
  /** Snippet ids. Absent: every embed of the path, whole-file embeds included. */
  ids?: string[];
  reason: string;
}

export function loadExceptions(): ExceptionEntry[] {
  if (!fs.existsSync(EXCEPTIONS_FILE)) return [];
  const raw = JSON.parse(fs.readFileSync(EXCEPTIONS_FILE, 'utf8')) as { exceptions?: ExceptionEntry[] };
  return raw.exceptions ?? [];
}

/** Problems with the exceptions file itself (shape only; the docs cross-check reports unused entries). */
export function checkExceptions(entries: ExceptionEntry[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  entries.forEach((e, i) => {
    const where = `snippet-exceptions.json entry ${i + 1} (${e.path ?? '?'})`;
    if (typeof e.path !== 'string' || !e.path.startsWith('test/integration/live/'))
      problems.push(`${where}: "path" must be a test/integration/live/... path`);
    if (typeof e.reason !== 'string' || e.reason.trim().length < 10) problems.push(`${where}: "reason" is required`);
    if (
      e.ids !== undefined &&
      (!Array.isArray(e.ids) || e.ids.length === 0 || e.ids.some((x) => typeof x !== 'string'))
    ) {
      problems.push(`${where}: "ids" must be a non-empty array of strings, or absent`);
    }
    for (const id of e.ids ?? ['*']) {
      const key = `${e.path}#${id}`;
      if (seen.has(key)) problems.push(`${where}: ${id === '*' ? 'path' : `id ${id}`} is listed twice`);
      seen.add(key);
    }
  });
  return problems;
}

export function buildManifest(scan: TierScan = scanTier()): { manifest: Manifest; problems: string[] } {
  const problems: string[] = [];
  const snippets: Record<string, SnippetEntry> = {};
  const origin = new Map<string, string>();
  for (const s of scan.snippets) {
    const where = `${s.file}:${s.line}`;
    if (s.mode === 'invalid') {
      problems.push(
        `${where}: snippet "${s.id}" is not run by any test (see the marker lint), left out of the manifest`,
      );
      continue;
    }
    if (origin.has(s.id)) {
      problems.push(
        `${where}: duplicate snippet id "${s.id}" (first at ${origin.get(s.id)}), left out of the manifest`,
      );
      continue;
    }
    origin.set(s.id, where);
    const entry: SnippetEntry = { file: s.file, mode: s.mode };
    if (s.test !== undefined) entry.test = s.test;
    if (s.role !== undefined && s.mode !== 'compile-only') entry.role = s.role;
    // Key order: file, test, role, mode (stable, readable).
    snippets[s.id] = {
      file: entry.file,
      ...(entry.test ? { test: entry.test } : {}),
      ...(entry.role ? { role: entry.role } : {}),
      mode: entry.mode,
    };
  }
  const files: Record<string, FileEntry> = {};
  for (const sample of scan.samples) {
    if (sample.test) files[sample.file] = { mode: 'live', test: sample.test.title, testFile: sample.test.file };
  }
  const sortKeys = <T>(o: Record<string, T>): Record<string, T> =>
    Object.fromEntries(
      Object.keys(o)
        .sort()
        .map((k) => [k, o[k]]),
    );
  return {
    manifest: {
      $comment:
        'GENERATED by npm run test:integration:live:manifest from the markers in test/integration/live (and the mocked allow-list in support/snippet-scan.ts). DO NOT EDIT. One entry per snippet id. Deliberate exceptions live in snippet-exceptions.json.',
      snippets: sortKeys(snippets),
      files: sortKeys(files),
    },
    problems,
  };
}

export function serialize(manifest: Manifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function totals(manifest: Manifest): Record<Mode, number> {
  const t: Record<Mode, number> = { live: 0, 'compile-only': 0, mocked: 0 };
  for (const e of Object.values(manifest.snippets)) t[e.mode] += 1;
  return t;
}

/** Reads coverage.json; undefined when absent. docs-check uses it to know what is covered. */
export function readManifest(): Manifest | undefined {
  return fs.existsSync(COVERAGE_FILE) ? (JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8')) as Manifest) : undefined;
}

function diffSummary(oldM: Manifest, newM: Manifest): string[] {
  const out: string[] = [];
  const ids = new Set([...Object.keys(oldM.snippets ?? {}), ...Object.keys(newM.snippets)]);
  for (const id of [...ids].sort()) {
    const a = oldM.snippets?.[id];
    const b = newM.snippets[id];
    if (!a) out.push(`  + ${id} (${b.file})`);
    else if (!b) out.push(`  - ${id} (${a.file})`);
    else if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`  ~ ${id}`);
  }
  const files = new Set([...Object.keys(oldM.files ?? {}), ...Object.keys(newM.files)]);
  for (const f of [...files].sort()) {
    if (JSON.stringify(oldM.files?.[f]) !== JSON.stringify(newM.files[f])) out.push(`  ~ file ${f}`);
  }
  return out;
}

export function main(argv: string[]): number {
  const check = argv.includes('--check');
  const { manifest, problems } = buildManifest();
  const exceptionProblems = checkExceptions(loadExceptions());
  const text = serialize(manifest);
  const t = totals(manifest);
  const summary = `${Object.keys(manifest.snippets).length} snippets (live ${t.live}, compile-only ${t['compile-only']}, mocked ${t.mocked}), ${Object.keys(manifest.files).length} whole-file sample(s)`;
  let failed = false;
  for (const p of [...problems, ...exceptionProblems]) {
    console.error(p);
    failed = true;
  }
  if (check) {
    const current = fs.existsSync(COVERAGE_FILE) ? fs.readFileSync(COVERAGE_FILE, 'utf8') : undefined;
    if (current === text) console.log(`coverage.json is up to date: ${summary}.`);
    else {
      failed = true;
      console.error('coverage.json is stale. Run: npm run test:integration:live:manifest');
      if (current) {
        try {
          diffSummary(JSON.parse(current) as Manifest, manifest)
            .slice(0, 30)
            .forEach((l) => console.error(l));
        } catch {
          console.error('  (coverage.json does not parse)');
        }
      } else console.error('  (coverage.json is missing)');
    }
  } else {
    fs.writeFileSync(COVERAGE_FILE, text);
    console.log(`wrote ${path.relative(process.cwd(), COVERAGE_FILE)}: ${summary}.`);
  }
  return failed ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
