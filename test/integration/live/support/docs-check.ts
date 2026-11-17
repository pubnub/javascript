/**
 * Docs cross-check: does every snippet the public docs embed from this repository map to a test that runs it?
 *
 *   npm run test:integration:live:docs-check -- [<path to the documentation checkout>] [--report-only]
 *
 * The checkout comes from the first non-flag argument, then $DOCS_REPO, then ../documentation next to this repository.
 * It parses every <EmbeddedCode> tag whose url points at pubnub/javascript and classifies each embedded id (or whole-file
 * embed) as live / compile-only / mocked / exception (snippet-exceptions.json) / NOT COVERED. The file named by the url must
 * be a path under `test/integration/live/` or one of the mocked test files, it must exist, and the coverage manifest must list
 * each requested id for that very file; any other path is NOT COVERED. Exit code 1 when anything is NOT COVERED, unless
 * --report-only. The documentation checkout is only read. No network.
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadExceptions, type ExceptionEntry, type Manifest } from './manifest';
import { buildManifest } from './manifest';
import { LIVE_REL, MOCKED_FILES, REPO_ROOT } from './snippet-scan';
import { docsExtract } from './snippets';

/** Pages nobody maintains (decided by the docs owner): their embeds are skipped with a note. Relative to the docs checkout. */
export const OUT_OF_SCOPE_PAGES = [
  'docs/sdks/javascript/api-reference/users.md',
  'docs/sdks/javascript/api-reference/spaces.md',
  'docs/sdks/javascript/api-reference/memberships.md',
  'docs/sdks/javascript/api-reference/access-manager-v2.md',
];

export interface Embed {
  docsFile: string;
  /** Line of `<EmbeddedCode`. */
  line: number;
  /** Line of the `url=` attribute. */
  urlLine: number;
  url: string;
  path: string;
  ids: string[];
  wholeFile: boolean;
}

export type Status = 'live' | 'compile-only' | 'mocked' | 'exception' | 'NOT COVERED';
const STATUSES: Status[] = ['live', 'compile-only', 'mocked', 'exception', 'NOT COVERED'];

export interface IdResult {
  id: string | null;
  status: Status;
  reason?: string;
  /** Test that runs it (covered), or the exception reason. */
  detail?: string;
}

function walkMd(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (/\.mdx?$/.test(e.name)) out.push(full);
  }
  return out.sort();
}

/** End index (exclusive) of the tag that starts at `start`: the `/>` outside quotes and braces. */
function tagEnd(text: string, start: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = undefined;
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '/' && text[i + 1] === '>' && depth <= 0) return i + 2;
  }
  return -1;
}

export function parseEmbeds(docsFile: string, text: string): { embeds: Embed[]; problems: string[] } {
  const embeds: Embed[] = [];
  const problems: string[] = [];
  const lineAt = (index: number): number => text.slice(0, index).split('\n').length;
  let from = 0;
  for (;;) {
    const start = text.indexOf('<EmbeddedCode', from);
    if (start === -1) break;
    const end = tagEnd(text, start);
    if (end === -1) {
      problems.push(`${docsFile}:${lineAt(start)}  unterminated <EmbeddedCode> tag`);
      break;
    }
    from = end;
    const tag = text.slice(start, end);
    const url = /\burl=(?:\{\s*)?(['"`])([^'"`]*)\1/.exec(tag);
    if (!url) continue;
    const m = /^https:\/\/raw\.githubusercontent\.com\/pubnub\/javascript\/refs\/heads\/[^/]+\/(.+)$/.exec(url[2]);
    if (!m) {
      if (/pubnub\/javascript\b/.test(url[2]))
        problems.push(`${docsFile}:${lineAt(start)}  unrecognised pubnub/javascript url ${url[2]}`);
      continue;
    }
    const list = /\bsnippets=\{\s*\[([\s\S]*?)\]\s*\}/.exec(tag);
    const ids = list
      ? [...list[1].matchAll(/(['"`])([^'"`]*)\1/g)].map((x) => x[2]).filter((x) => x.trim() !== '')
      : [];
    if (/\b(start|end)=\{?\s*\d/.test(tag))
      problems.push(`${docsFile}:${lineAt(start)}  embed uses line numbers (start/end): not stable, not checkable`);
    embeds.push({
      docsFile,
      line: lineAt(start),
      urlLine: lineAt(start + (url.index ?? 0)),
      url: url[2],
      path: m[1],
      ids,
      wholeFile: ids.length === 0,
    });
  }
  return { embeds, problems };
}

/** True when the path is a file of the tested tier: under test/integration/live/ or one of the mocked test files. */
export function isNewStylePath(p: string): boolean {
  return p.startsWith(`${LIVE_REL}/`) || MOCKED_FILES.includes(p);
}

function exceptionFor(
  exceptions: ExceptionEntry[],
  filePath: string,
  id: string | null,
  used: Set<ExceptionEntry>,
): ExceptionEntry | undefined {
  const hit = exceptions.find(
    (e) => e.path === filePath && (e.ids === undefined || (id !== null && e.ids.includes(id))),
  );
  if (hit) used.add(hit);
  return hit;
}

/** The file is named by the url itself, so it is checked as it stands. */
function classifyTested(
  embed: Embed,
  manifest: Manifest,
  exceptions: ExceptionEntry[],
  used: Set<ExceptionEntry>,
): IdResult[] {
  const file = embed.path;
  const exists = fs.existsSync(path.join(REPO_ROOT, file));
  if (embed.wholeFile) {
    const sample = manifest.files[file];
    if (exists && sample) {
      return [{ id: null, status: 'live', detail: `${sample.testFile} :: ${sample.test}` }];
    }
    const ex = exceptionFor(exceptions, file, null, used);
    if (ex) return [{ id: null, status: 'exception', detail: ex.reason }];
    return [
      {
        id: null,
        status: 'NOT COVERED',
        reason: exists
          ? `whole-file embed of ${file}, which no test runs as a file (a whole-file embed needs a sample file such as quickstart-node.mjs that a test executes)`
          : `whole-file embed: ${file} does not exist`,
      },
    ];
  }
  return embed.ids.map((id): IdResult => {
    const entry = manifest.snippets[id];
    if (exists && entry && entry.file === file) {
      if (docsExtract(fs.readFileSync(path.join(REPO_ROOT, file), 'utf8'), id) === undefined) {
        return {
          id,
          status: 'NOT COVERED',
          reason: `${file} has the marker but the docs extractor finds no text for "${id}" (empty or malformed)`,
        };
      }
      return {
        id,
        status: entry.mode,
        detail: entry.test ?? 'import-only, loaded with the file',
      };
    }
    const ex = exceptionFor(exceptions, file, id, used);
    if (ex) return { id, status: 'exception', detail: ex.reason };
    const reason = !exists
      ? `${file} does not exist`
      : entry
        ? `id is not in ${file}; it is ${entry.mode} in ${entry.file}`
        : `id is not in the coverage manifest (not found in ${file})`;
    return { id, status: 'NOT COVERED', reason };
  });
}

export function classify(
  embed: Embed,
  manifest: Manifest,
  exceptions: ExceptionEntry[],
  used: Set<ExceptionEntry>,
): IdResult[] {
  if (isNewStylePath(embed.path)) return classifyTested(embed, manifest, exceptions, used);
  const reason = `path is not under ${LIVE_REL}/ (${embed.path})`;
  return embed.wholeFile
    ? [{ id: null, status: 'NOT COVERED', reason }]
    : embed.ids.map((id): IdResult => ({ id, status: 'NOT COVERED', reason }));
}

function worst(results: IdResult[]): Status {
  for (const s of ['NOT COVERED', 'exception', 'mocked', 'compile-only', 'live'] as Status[])
    if (results.some((r) => r.status === s)) return s;
  return 'live';
}

export function main(argv: string[]): number {
  const reportOnly = argv.includes('--report-only');
  const positional = argv.filter((a) => !a.startsWith('--'));
  const defaultDir = path.resolve(REPO_ROOT, '../documentation');
  const docsDir = path.resolve(positional[0] ?? process.env.DOCS_REPO ?? (fs.existsSync(defaultDir) ? defaultDir : ''));
  if (!docsDir || !fs.existsSync(docsDir)) {
    console.error(
      'docs-check: no documentation checkout. Pass its path, set DOCS_REPO, or put it at ../documentation.',
    );
    return 2;
  }
  const scanRoot = fs.existsSync(path.join(docsDir, 'docs')) ? path.join(docsDir, 'docs') : docsDir;
  const { manifest } = buildManifest();
  const exceptions = loadExceptions();
  const used = new Set<ExceptionEntry>();

  const rows: Array<{ embed: Embed; results: IdResult[]; status: Status }> = [];
  const skipped: Embed[] = [];
  const problems: string[] = [];
  for (const file of walkMd(scanRoot)) {
    const rel = path.relative(docsDir, file).split(path.sep).join('/');
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('pubnub/javascript/')) continue;
    const parsed = parseEmbeds(rel, text);
    if (OUT_OF_SCOPE_PAGES.includes(rel)) {
      skipped.push(...parsed.embeds);
      continue;
    }
    problems.push(...parsed.problems);
    for (const embed of parsed.embeds) {
      const results = classify(embed, manifest, exceptions, used);
      rows.push({ embed, results, status: worst(results) });
    }
  }

  // Summary.
  const embedCount: Record<string, number> = {};
  const refCount: Record<string, number> = {};
  for (const s of STATUSES) embedCount[s] = refCount[s] = 0;
  for (const row of rows) {
    embedCount[row.status] += 1;
    for (const r of row.results) refCount[r.status] += 1;
  }
  const pad = (s: string | number, n: number): string => String(s).padEnd(n);
  console.log(`docs checkout: ${docsDir}`);
  console.log(
    `out of scope (skipped): ${OUT_OF_SCOPE_PAGES.map((p) => path.basename(p)).join(', ')}: ${skipped.length} embed(s)`,
  );
  console.log('');
  console.log(`${pad('status', 14)}${pad('embeds', 8)}ids/whole files`);
  for (const s of STATUSES) console.log(`${pad(s, 14)}${pad(embedCount[s], 8)}${refCount[s]}`);
  console.log(`${pad('total', 14)}${pad(rows.length, 8)}${rows.reduce((n, r) => n + r.results.length, 0)}`);
  problems.forEach((p) => console.log(`note: ${p}`));

  // NOT COVERED, grouped by docs file.
  const bad = rows.filter((r) => r.results.some((x) => x.status === 'NOT COVERED'));
  if (bad.length > 0) {
    console.log('\nNOT COVERED');
    const byFile = new Map<string, typeof bad>();
    for (const r of bad) byFile.set(r.embed.docsFile, [...(byFile.get(r.embed.docsFile) ?? []), r]);
    for (const [file, list] of [...byFile].sort()) {
      console.log(`  ${file}`);
      for (const r of list) {
        for (const x of r.results.filter((y) => y.status === 'NOT COVERED')) {
          console.log(`    :${r.embed.line}  ${r.embed.path}  ${x.id ?? '(whole file)'}  ${x.reason ?? ''}`);
        }
      }
    }
  }

  const unused = exceptions.filter((e) => !used.has(e));
  unused.forEach((e) =>
    console.log(`note: exception for ${e.path}${e.ids ? ` [${e.ids.join(', ')}]` : ''} matches no embed in the docs`),
  );

  const failed = embedCount['NOT COVERED'] > 0;
  if (failed)
    console.log(
      reportOnly
        ? '\nNOT COVERED embeds present (--report-only: exit 0)'
        : '\ndocs-check failed: NOT COVERED embeds present',
    );
  return failed && !reportOnly ? 1 : 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
