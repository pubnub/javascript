/**
 * Docs cross-check: does every snippet the public docs embed from this repository map to a test that runs it?
 *
 *   npm run test:integration:live:docs-check -- [<path to the documentation checkout>] [--report-only] [--out <file>]
 *
 * The checkout comes from the first non-flag argument, then $DOCS_REPO, then ../documentation next to this repository.
 * It parses every <EmbeddedCode> tag whose url points at pubnub/javascript and classifies each embedded id (or whole-file
 * embed) as live / compile-only / mocked / exception (snippet-exceptions.json) / NOT COVERED. Two URL styles are understood:
 * an old-style url (`docs-snippets/<folder>/<page>.ts`) is mapped to `test/integration/live/<folder>/<page>.test.ts`; a
 * new-style url (a path under `test/integration/live/`, or one of the mocked test files) is checked as it stands: the file must
 * exist and the coverage manifest must list each requested id for that very file. Exit code 1 when anything is NOT COVERED,
 * unless --report-only. It writes the repoint list for a later mechanical edit of the docs URLs (default
 * /tmp/pn-live/docs-repoint.json). The documentation checkout is only read. No network.
 */
import { spawnSync } from 'node:child_process';
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

const TMP_DIR = '/tmp/pn-live';

export interface Embed {
  docsFile: string;
  /** Line of `<EmbeddedCode`. */
  line: number;
  /** Line of the `url=` attribute. */
  urlLine: number;
  oldUrl: string;
  oldPath: string;
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
  /** Where the same id is covered in another file of the tier (duplicate copy). */
  twin?: { file: string; identical: boolean | null; tryOnly?: boolean; diffFile?: string };
  textMatch?: 'identical' | 'different' | 'old-missing';
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
      oldUrl: url[2],
      oldPath: m[1],
      ids,
      wholeFile: ids.length === 0,
    });
  }
  return { embeds, problems };
}

/** True when the embed already points at a file of the tested tier (a new-style url) rather than at `docs-snippets/`. */
export function isNewStylePath(p: string): boolean {
  return p.startsWith(`${LIVE_REL}/`) || MOCKED_FILES.includes(p);
}

/** `docs-snippets/<folder>/<page>.ts` becomes `test/integration/live/<folder>/<page>.test.ts`; other extensions keep their name. */
export function mapPath(oldPath: string): string | undefined {
  const m = /^docs-snippets\/(.+)$/.exec(oldPath);
  if (!m) return undefined;
  const rest = m[1];
  return `${LIVE_REL}/${/\.ts$/.test(rest) && !/\.d\.ts$/.test(rest) ? rest.replace(/\.ts$/, '.test.ts') : rest}`;
}

function readIfExists(rel: string): string | undefined {
  const abs = path.join(REPO_ROOT, rel);
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : undefined;
}

/** The old copies wrap the call in `try { ... } catch (e) { console.error(...) }`. Removes that wrapper (and two spaces of indent). */
function unwrapTry(text: string): string | undefined {
  const lines = text.split('\n');
  const open = lines.findIndex((l) => l === 'try {');
  const close = lines.findIndex((l, i) => i > open && /^\} catch \(\w+\) \{$/.test(l));
  if (open === -1 || close === -1) return undefined;
  const body = lines.slice(open + 1, close).map((l) => (l.startsWith('  ') ? l.slice(2) : l));
  return [...lines.slice(0, open), ...body].join('\n');
}

function slug(s: string): string {
  return s.replace(/[^A-Za-z0-9_-]+/g, '_');
}

function exceptionFor(
  exceptions: ExceptionEntry[],
  oldPath: string,
  id: string | null,
  used: Set<ExceptionEntry>,
): ExceptionEntry | undefined {
  const hit = exceptions.find(
    (e) => e.path === oldPath && (e.ids === undefined || (id !== null && e.ids.includes(id))),
  );
  if (hit) used.add(hit);
  return hit;
}

/** New-style url: the file is named by the url itself, so it is checked as it stands (no mapping, no old copy to compare). */
function classifyNewStyle(
  embed: Embed,
  manifest: Manifest,
  exceptions: ExceptionEntry[],
  used: Set<ExceptionEntry>,
): IdResult[] {
  const file = embed.oldPath;
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
      if (docsExtract(readIfExists(file) ?? '', id) === undefined) {
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
  if (isNewStylePath(embed.oldPath)) return classifyNewStyle(embed, manifest, exceptions, used);
  const target = mapPath(embed.oldPath);
  const results: IdResult[] = [];
  if (embed.wholeFile) {
    const sample = target ? manifest.files[target] : undefined;
    if (sample) {
      const old = readIfExists(embed.oldPath);
      const now = readIfExists(target!);
      results.push({
        id: null,
        status: 'live',
        detail: `${sample.testFile} :: ${sample.test}`,
        textMatch: old === undefined ? 'old-missing' : old === now ? 'identical' : 'different',
      });
      return results;
    }
    const ex = exceptionFor(exceptions, embed.oldPath, null, used);
    if (ex) return [{ id: null, status: 'exception', detail: ex.reason }];
    const reason = !target
      ? `path is not under docs-snippets/ (${embed.oldPath})`
      : fs.existsSync(path.join(REPO_ROOT, target))
        ? `whole-file embed of ${target}, which no test runs as a file (a whole-file embed needs a sample file such as quickstart-node.mjs that a test executes)`
        : `whole-file embed: no sample file ${target}`;
    return [{ id: null, status: 'NOT COVERED', reason }];
  }
  for (const id of embed.ids) {
    const entry = manifest.snippets[id];
    if (target && entry && entry.file === target) {
      const old = readIfExists(embed.oldPath);
      const oldText = old === undefined ? undefined : docsExtract(old, id);
      const newText = docsExtract(readIfExists(target) ?? '', id);
      if (newText === undefined) {
        results.push({
          id,
          status: 'NOT COVERED',
          reason: `${target} has the marker but the docs extractor finds no text for "${id}" (empty or malformed)`,
        });
        continue;
      }
      results.push({
        id,
        status: entry.mode,
        detail: entry.test ?? 'import-only, loaded with the file',
        textMatch: oldText === undefined ? 'old-missing' : oldText === newText ? 'identical' : 'different',
      });
      continue;
    }
    const ex = exceptionFor(exceptions, embed.oldPath, id, used);
    if (ex) {
      results.push({ id, status: 'exception', detail: ex.reason });
      continue;
    }
    let reason: string;
    if (!target) reason = `path is not under docs-snippets/ (${embed.oldPath})`;
    else if (!fs.existsSync(path.join(REPO_ROOT, target))) reason = `${target} does not exist`;
    else reason = `id is not in ${target}`;
    const result: IdResult = { id, status: 'NOT COVERED', reason };
    if (entry) {
      // The same id is tested in another file: an old duplicate copy.
      const oldText = (() => {
        const old = readIfExists(embed.oldPath);
        return old === undefined ? undefined : docsExtract(old, id);
      })();
      const twinText = docsExtract(readIfExists(entry.file) ?? '', id);
      const twin: NonNullable<IdResult['twin']> = {
        file: entry.file,
        identical: oldText === undefined || twinText === undefined ? null : oldText === twinText,
      };
      if (twin.identical === false && oldText !== undefined) twin.tryOnly = unwrapTry(oldText) === twinText;
      if (twin.identical === false) {
        fs.mkdirSync(path.join(TMP_DIR, 'dup-diffs'), { recursive: true });
        const base = path.join(
          TMP_DIR,
          'dup-diffs',
          `${slug(embed.oldPath.replace(/^docs-snippets\//, ''))}__${slug(id)}`,
        );
        fs.writeFileSync(`${base}.old.txt`, `${oldText}\n`);
        fs.writeFileSync(`${base}.new.txt`, `${twinText}\n`);
        const diff = spawnSync(
          'diff',
          ['-u', `--label=old:${embed.oldPath}`, `--label=tested:${entry.file}`, `${base}.old.txt`, `${base}.new.txt`],
          { encoding: 'utf8' },
        );
        fs.writeFileSync(`${base}.diff`, diff.stdout);
        twin.diffFile = `${base}.diff`;
      }
      result.twin = twin;
      result.reason = `${reason}; the same id is ${entry.mode} in ${entry.file}`;
    }
    results.push(result);
  }
  return results;
}

function worst(results: IdResult[]): Status {
  for (const s of ['NOT COVERED', 'exception', 'mocked', 'compile-only', 'live'] as Status[])
    if (results.some((r) => r.status === s)) return s;
  return 'live';
}

export function main(argv: string[]): number {
  const reportOnly = argv.includes('--report-only');
  const outIndex = argv.indexOf('--out');
  const out = outIndex >= 0 ? argv[outIndex + 1] : path.join(TMP_DIR, 'docs-repoint.json');
  const positional = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
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
  const alreadyNew = rows.filter((r) => isNewStylePath(r.embed.oldPath)).length;
  console.log(
    `new-style urls (already point at ${LIVE_REL}/ or a mocked test file): ${alreadyNew} of ${rows.length} embeds`,
  );
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
          console.log(`    :${r.embed.line}  ${r.embed.oldPath}  ${x.id ?? '(whole file)'}  ${x.reason ?? ''}`);
        }
      }
    }
  }

  // Duplicate copies: NOT COVERED embeds whose id is tested in another file.
  const twins = rows.flatMap((r) => r.results.filter((x) => x.twin).map((x) => ({ embed: r.embed, x })));
  if (twins.length > 0) {
    const seen = new Set<string>();
    console.log('\nDuplicate copies (old copy vs the tested twin, text extracted with the docs rules)');
    for (const { embed, x } of twins) {
      const key = `${embed.oldPath}#${x.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const verdict =
        x.twin!.identical === null
          ? 'UNKNOWN (old copy missing)'
          : x.twin!.identical
            ? 'IDENTICAL'
            : x.twin!.tryOnly
              ? 'DIFFERENT (only the try/catch wrapper of the old copy)'
              : 'DIFFERENT';
      console.log(
        `  ${verdict} ${embed.oldPath} :: ${x.id}  ->  ${x.twin!.file}${x.twin!.diffFile ? `  (diff: ${x.twin!.diffFile})` : ''}`,
      );
    }
  }

  // Text of directly mapped embeds.
  const differing = rows.flatMap((r) =>
    r.results.filter((x) => x.textMatch === 'different').map((x) => `${r.embed.oldPath} :: ${x.id ?? '(whole file)'}`),
  );
  const compared = rows.flatMap((r) =>
    r.results.filter((x) => x.textMatch === 'identical' || x.textMatch === 'different'),
  );
  console.log(
    `\ntext of old-style embeds vs the file they map to (docs extractor rules; embeds that already use the new path are not compared): ${compared.length - differing.length} identical, ${differing.length} different`,
  );
  [...new Set(differing)].forEach((d) => console.log(`  DIFFERENT ${d}`));

  const unused = exceptions.filter((e) => !used.has(e));
  unused.forEach((e) =>
    console.log(`note: exception for ${e.path}${e.ids ? ` [${e.ids.join(', ')}]` : ''} matches no embed in the docs`),
  );

  // Repoint file.
  const repoint = rows.map(({ embed, results, status }) => {
    if (isNewStylePath(embed.oldPath)) {
      // Already repointed: nothing to change (an exception still reads `keep`).
      const done = status === 'exception' ? 'keep' : status === 'NOT COVERED' ? 'blocked' : 'done';
      return {
        docsFile: embed.docsFile,
        line: embed.line,
        urlLine: embed.urlLine,
        oldUrl: embed.oldUrl,
        oldPath: embed.oldPath,
        newPath: done === 'blocked' ? null : embed.oldPath,
        newUrl: done === 'blocked' ? null : embed.oldUrl,
        ids: embed.ids,
        wholeFile: embed.wholeFile,
        status,
        action: done,
        ...(done === 'blocked' ? { wouldBePath: null, twinFile: null } : {}),
        perId: results.map((r) => ({ id: r.id, status: r.status })),
      };
    }
    const target = mapPath(embed.oldPath);
    const twinFiles = [...new Set(results.filter((r) => r.status === 'NOT COVERED').map((r) => r.twin?.file))];
    // An embed that points at an old duplicate copy is repointed to the tested twin (the docs owner decided so), when every id
    // that is not covered has a twin and all twins sit in one file. Anything else stays blocked.
    const toTwin = status === 'NOT COVERED' && twinFiles.length === 1 && twinFiles[0] !== undefined;
    const twinFile = toTwin ? twinFiles[0] : results.find((r) => r.twin)?.twin?.file;
    const action = toTwin
      ? 'repoint-to-twin'
      : status === 'NOT COVERED'
        ? 'blocked'
        : status === 'exception'
          ? 'keep'
          : 'repoint';
    const newPath =
      action === 'repoint'
        ? (target ?? null)
        : action === 'keep'
          ? embed.oldPath
          : action === 'repoint-to-twin'
            ? twinFile!
            : null;
    return {
      docsFile: embed.docsFile,
      line: embed.line,
      urlLine: embed.urlLine,
      oldUrl: embed.oldUrl,
      oldPath: embed.oldPath,
      newPath,
      newUrl: newPath ? embed.oldUrl.replace(embed.oldPath, newPath) : null,
      ids: embed.ids,
      wholeFile: embed.wholeFile,
      status,
      action,
      ...(action === 'blocked' ? { wouldBePath: target ?? null, twinFile: twinFile ?? null } : {}),
      perId: results.map((r) => ({
        id: r.id,
        status: r.status,
        ...(r.twin
          ? {
              twin: r.twin.file,
              twinText:
                r.twin.identical === null
                  ? 'unknown'
                  : r.twin.identical
                    ? 'IDENTICAL'
                    : r.twin.tryOnly
                      ? 'DIFFERENT-try-catch-wrapper-only'
                      : 'DIFFERENT',
            }
          : {}),
      })),
    };
  });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(
    out,
    `${JSON.stringify(
      {
        $comment:
          'Generated by test/integration/live/support/docs-check.ts. action: repoint = change oldPath to newPath in the url; repoint-to-twin = the embed points at an old duplicate copy, change oldPath to newPath, the path of the tested twin file (decided by the docs owner); keep = documented exception, url stays; done = the url already points at the tested tier; blocked = not covered and no twin.',
        docsDir,
        embeds: repoint,
        outOfScope: skipped.map((e) => ({ docsFile: e.docsFile, line: e.line, oldPath: e.oldPath, ids: e.ids })),
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `\nrepoint list: ${out} (${repoint.filter((r) => r.action === 'repoint').length} repoint, ${repoint.filter((r) => r.action === 'repoint-to-twin').length} repoint-to-twin, ${repoint.filter((r) => r.action === 'keep').length} keep, ${repoint.filter((r) => r.action === 'done').length} done, ${repoint.filter((r) => r.action === 'blocked').length} blocked)`,
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
