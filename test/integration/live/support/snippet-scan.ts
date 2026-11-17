/**
 * Shared scanner of the snippet tier: finds the files that can hold snippet markers, scans the markers with the exact syntax
 * of the docs extractor, and uses the TypeScript compiler API to find the `it()` callback (and the `describe()` chain) that
 * runs each snippet. The marker lint (lint-markers.ts), the coverage manifest (manifest.ts) and the docs cross-check
 * (docs-check.ts) all build on it. Pure file reads: no network, no keys, nothing is executed.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

export const REPO_ROOT = path.resolve(__dirname, '../../../..');
export const LIVE_DIR = path.join(REPO_ROOT, 'test/integration/live');
export const LIVE_REL = 'test/integration/live';

/**
 * The one place that lists nock-mocked tests outside `live/` which carry snippet markers (mode `mocked`). Repository relative
 * paths. Keep it short: a snippet belongs here only when a real server cannot produce what it shows on demand (retry policies
 * against a failing server, a heartbeat failure).
 */
export const MOCKED_FILES: readonly string[] = [
  'test/integration/endpoints/objects/channel.test.ts',
  'test/integration/endpoints/time.test.ts',
  'test/integration/components/subscription_manager.test.ts',
];

/** Directories under live/ that never hold samples. */
const SKIP_DIRS = new Set(['node_modules', 'support', 'provision', 'fixtures', '.run']);
const SAMPLE_EXT = /\.(mjs|cjs|js|jsx|tsx|ts|html)$/;

export type Mode = 'live' | 'compile-only' | 'mocked';

export interface Issue {
  file: string;
  line: number;
  message: string;
}

export interface HiddenBlock {
  hideLine: number;
  showLine?: number;
}

export interface Region {
  id: string;
  startLine: number;
  /** Line of `snippet.end`, or of the marker that closed the region implicitly. */
  endLine: number;
  explicitEnd: boolean;
  hidden: HiddenBlock[];
}

export interface ItBlock {
  /** Full Mocha title: the describe chain and the it title, joined by a space (Mocha's `fullTitle()`). */
  fullTitle: string;
  title: string;
  startLine: number;
  endLine: number;
  fn: ts.FunctionLikeDeclaration;
  node: ts.CallExpression;
  /** `it.skip`, `xit` and the like. */
  skipped: boolean;
}

export interface ScannedFile {
  /** Repository relative path with forward slashes. */
  rel: string;
  abs: string;
  kind: 'test' | 'sample' | 'mocked';
  text: string;
  source: ts.SourceFile;
  regions: Region[];
  /** Marker syntax problems (errors) found while scanning. */
  problems: Issue[];
  /** Warnings from the scan (the slash id). */
  warnings: Issue[];
  its: ItBlock[];
  lineOf: (pos: number) => number;
}

/** Where a region runs, resolved from the AST. */
export type Owner =
  | { type: 'it'; it: ItBlock }
  | { type: 'helper'; name: string; fn: ts.FunctionLikeDeclaration }
  | { type: 'import-only' }
  /** A file-level sample that a named `it()` asserts: `// lint: asserted-by <part of the it title>` on the line after `snippet.end`. */
  | { type: 'file-level'; it: ItBlock; needle: string; line: number }
  | { type: 'file-level-error'; message: string; line: number }
  | { type: 'none'; reason: string };

// The docs extractor matches `// ` (with the space, because its default prefix is "// "), then optional blanks, then
// `snippet.<id>`. These are the same shapes.
const MARKER = /^\s*\/\/ \s*snippet\.([A-Za-z0-9_/-]+)\s*$/;
// Anything that starts like a marker: used to report near misses the extractor would silently ignore.
const ASSERTED_BY = /^\s*\/\/\s*lint:\s*asserted-by\s+(\S.*?)\s*$/;
const LOOSE = /^\s*\/\/\s*(?:snippet\.|end\.snippet)/;
const LOOSE_TOKEN = /^\s*\/\/\s*snippet\.(\S+)\s*$/;

function toRel(abs: string): string {
  return path.relative(REPO_ROOT, abs).split(path.sep).join('/');
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(full));
    } else out.push(full);
  }
  return out.sort();
}

/** Every file that can hold markers: `*.test.ts` and sample files under live/, plus the mocked allow-list. Sorted. */
export function listFiles(): Array<{ abs: string; kind: ScannedFile['kind'] }> {
  const files: Array<{ abs: string; kind: ScannedFile['kind'] }> = [];
  for (const abs of walk(LIVE_DIR)) {
    if (/\.test\.ts$/.test(abs)) files.push({ abs, kind: 'test' });
    else if (SAMPLE_EXT.test(abs) && !/\.d\.ts$/.test(abs)) files.push({ abs, kind: 'sample' });
  }
  for (const rel of MOCKED_FILES) files.push({ abs: path.join(REPO_ROOT, rel), kind: 'mocked' });
  return files;
}

export function scanMarkers(rel: string, text: string): { regions: Region[]; problems: Issue[]; warnings: Issue[] } {
  const regions: Region[] = [];
  const problems: Issue[] = [];
  const warnings: Issue[] = [];
  let open: Region | undefined;
  let openHide: HiddenBlock | undefined;
  const bad = (line: number, message: string): void => void problems.push({ file: rel, line, message });
  const close = (line: number, explicit: boolean): void => {
    if (!open) return;
    open.endLine = line;
    open.explicitEnd = explicit;
    if (openHide) {
      bad(openHide.hideLine, `snippet.hide in "${open.id}" has no snippet.show`);
      openHide = undefined;
    }
    regions.push(open);
    open = undefined;
  };
  const lines = text.split('\n');
  lines.forEach((raw, index) => {
    const line = index + 1;
    const match = MARKER.exec(raw);
    if (!match) {
      if (LOOSE.test(raw)) {
        const token = LOOSE_TOKEN.exec(raw)?.[1];
        if (/^\s*\/\/[^ ]/.test(raw)) {
          bad(
            line,
            `marker needs a space after the slashes ("// snippet.…"); the docs extractor ignores this line: ${raw.trim()}`,
          );
        } else if (token !== undefined && !/^[A-Za-z0-9_-]+$/.test(token)) {
          bad(
            line,
            `snippet id "${token}" has characters outside [a-zA-Z0-9_-]; the docs extractor does not see it as a marker`,
          );
        } else {
          bad(line, `marker-like comment is not a valid marker (the docs extractor ignores it): ${raw.trim()}`);
        }
      }
      return;
    }
    const word = match[1];
    if (word === 'end') {
      if (!open) bad(line, 'snippet.end without an open snippet');
      else close(line, true);
    } else if (word === 'hide') {
      if (!open) bad(line, 'snippet.hide outside a snippet');
      else if (openHide) bad(line, 'snippet.hide inside a hidden block');
      else {
        openHide = { hideLine: line };
        open.hidden.push(openHide);
      }
    } else if (word === 'show') {
      if (!open || !openHide) bad(line, 'snippet.show without a matching snippet.hide');
      else {
        openHide.showLine = line;
        openHide = undefined;
      }
    } else {
      const slash = word.includes('/');
      if (slash) {
        warnings.push({
          file: rel,
          line,
          message:
            `snippet id "${word}" contains "/": the docs extractor finds it as a start marker (it matches the requested id ` +
            'literally) but its implicit-end regex [a-zA-Z0-9_-]+ does not recognise it, so it never ends the snippet before it ' +
            'and, if the marker sits inside an open snippet, its line becomes part of that snippet text. Works only while the ' +
            'previous snippet has an explicit snippet.end. Rename the id in the docs when convenient.',
        });
      }
      if (open) {
        bad(
          line,
          slash
            ? `snippet "${word}" starts inside snippet "${open.id}": the marker line would show up in the text of "${open.id}"`
            : `snippet "${word}" starts inside snippet "${open.id}" (the docs extractor silently cuts "${open.id}" here)`,
        );
        close(line, false);
      }
      open = { id: word, startLine: line, endLine: line, explicitEnd: false, hidden: [] };
    }
  });
  if (open) {
    const dangling: Region = open;
    bad(
      dangling.startLine,
      `snippet "${dangling.id}" has no snippet.end (the docs extractor would run to the end of the file)`,
    );
    close(lines.length + 1, false);
  }
  return { regions, problems, warnings };
}

const DESCRIBE = new Set(['describe', 'context', 'suite']);
const IT = new Set(['it', 'specify', 'test']);

function calleeParts(call: ts.CallExpression): { root: string; member?: string } | undefined {
  const e = call.expression;
  if (ts.isIdentifier(e)) return { root: e.text };
  if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression))
    return { root: e.expression.text, member: e.name.text };
  return undefined;
}

function titleOf(call: ts.CallExpression, source: ts.SourceFile): string | undefined {
  const first = call.arguments[0];
  if (!first) return undefined;
  if (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) return first.text;
  if (ts.isTemplateExpression(first)) return first.getText(source);
  return undefined;
}

function callbackOf(call: ts.CallExpression): ts.FunctionLikeDeclaration | undefined {
  const fn = [...call.arguments].reverse().find((a) => ts.isArrowFunction(a) || ts.isFunctionExpression(a));
  return fn as ts.FunctionLikeDeclaration | undefined;
}

export function scanFile(abs: string, kind: ScannedFile['kind']): ScannedFile {
  const rel = toRel(abs);
  const text = fs.readFileSync(abs, 'utf8');
  const scriptKind = /\.(mjs|cjs|js)$/.test(abs)
    ? ts.ScriptKind.JS
    : /\.jsx$/.test(abs)
      ? ts.ScriptKind.JSX
      : /\.tsx$/.test(abs)
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS;
  const source = ts.createSourceFile(abs, text, ts.ScriptTarget.ES2022, true, scriptKind);
  const lineOf = (pos: number): number => source.getLineAndCharacterOfPosition(pos).line + 1;
  const { regions, problems, warnings } = scanMarkers(rel, text);
  const its: ItBlock[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const parts = calleeParts(node);
      const isIt =
        parts &&
        (IT.has(parts.root) || parts.root === 'xit') &&
        (!parts.member || ['only', 'skip'].includes(parts.member));
      const fn = callbackOf(node);
      if (parts && isIt && fn) {
        if (parts.member === 'only')
          problems.push({
            file: rel,
            line: lineOf(node.getStart(source)),
            message: 'it.only left in the file: Mocha would skip every other test',
          });
        const titles: string[] = [];
        for (let p: ts.Node | undefined = node.parent; p; p = p.parent) {
          if (ts.isCallExpression(p)) {
            const pp = calleeParts(p);
            if (pp && (DESCRIBE.has(pp.root) || pp.root === 'xdescribe')) {
              const t = titleOf(p, source);
              if (t !== undefined) titles.unshift(t);
            }
          }
        }
        const title = titleOf(node, source) ?? '(dynamic title)';
        const skippedDescribe = (() => {
          for (let p: ts.Node | undefined = node.parent; p; p = p.parent) {
            if (ts.isCallExpression(p)) {
              const pp = calleeParts(p);
              if (pp && (pp.root === 'xdescribe' || (DESCRIBE.has(pp.root) && pp.member === 'skip'))) return true;
            }
          }
          return false;
        })();
        its.push({
          fullTitle: [...titles, title].join(' '),
          title,
          startLine: lineOf(fn.getStart(source)),
          endLine: lineOf(fn.end),
          fn,
          node,
          skipped: parts.member === 'skip' || parts.root === 'xit' || skippedDescribe,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { rel, abs, kind, text, source, regions, problems, warnings, its, lineOf };
}

/** Innermost function-like node (not a describe/it callback of the harness) that contains the lines of `region`. */
function helperAround(file: ScannedFile, region: Region): { name: string; fn: ts.FunctionLikeDeclaration } | undefined {
  let best: ts.FunctionLikeDeclaration | undefined;
  const find = (node: ts.Node): void => {
    if (
      (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
      file.lineOf(node.getStart(file.source)) <= region.startLine &&
      file.lineOf(node.end) >= region.endLine
    ) {
      best = node;
    }
    ts.forEachChild(node, find);
  };
  find(file.source);
  if (!best) return undefined;
  if (ts.isFunctionDeclaration(best) && best.name) return { name: best.name.text, fn: best };
  const parent = best.parent;
  if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name))
    return { name: parent.name.text, fn: best };
  return undefined;
}

export function resolveOwner(file: ScannedFile, region: Region): Owner {
  const inside = file.its.filter((it) => it.startLine <= region.startLine && it.endLine >= region.endLine);
  if (inside.length > 0) {
    // The innermost it (the one that starts last).
    return { type: 'it', it: inside.reduce((a, b) => (b.startLine >= a.startLine ? b : a)) };
  }
  const helper = helperAround(file, region);
  if (helper) return { type: 'helper', ...helper };
  const overlapping = file.source.statements.filter(
    (s) => file.lineOf(s.getStart(file.source)) <= region.endLine && file.lineOf(s.end) >= region.startLine,
  );
  const importOnly =
    overlapping.length > 0 &&
    overlapping.every(
      (s) =>
        ts.isImportDeclaration(s) &&
        file.lineOf(s.getStart(file.source)) > region.startLine &&
        file.lineOf(s.end) < region.endLine,
    );
  if (importOnly) return { type: 'import-only' };
  // Narrow escape for a file-level sample that is not import-only (it contains functions and other code, so it cannot sit in an
  // it()): the line right after `snippet.end` says which test asserts its effect.
  const escapeLine = region.endLine + 1;
  const escape = ASSERTED_BY.exec(file.text.split('\n')[escapeLine - 1] ?? '');
  if (escape) {
    const needle = escape[1].trim();
    const matches = file.its.filter((it) => it.title.includes(needle));
    if (matches.length !== 1) {
      return {
        type: 'file-level-error',
        line: escapeLine,
        message: `\`lint: asserted-by ${needle}\` must match exactly one it() title in this file, it matches ${matches.length}`,
      };
    }
    return { type: 'file-level', it: matches[0], needle, line: escapeLine };
  }
  return {
    type: 'none',
    reason:
      'is neither inside one it() callback (or a named helper that an it() calls) nor an import-only snippet at the top of the file',
  };
}

/** True when `line` (1-based) is a visible, non-marker line of `region`. */
export function isVisibleLine(region: Region, line: number): boolean {
  if (line <= region.startLine || line >= region.endLine) return false;
  return !region.hidden.some((h) => line >= h.hideLine && line <= (h.showLine ?? region.endLine));
}

const ROLE_FUNCS: Record<string, 'arg' | 'open' | 'pam'> = {
  createClient: 'arg',
  keysOf: 'arg',
  shopper: 'open',
  friend: 'open',
  observer: 'open',
};

/** Keyset roles named in `node` (string role arguments of createClient/keysOf/server, defaults of shopper/friend/observer/server). */
function rolesIn(node: ts.Node, namedHelpers: Map<string, Set<string>>, depth = 0): Set<string> {
  const roles = new Set<string>();
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
      const name = n.expression.text;
      const kind = ROLE_FUNCS[name];
      const first = n.arguments[0];
      if (kind === 'arg' && first && ts.isStringLiteral(first)) roles.add(first.text);
      else if (kind === 'open') roles.add('open');
      else if (name === 'server') roles.add(first && ts.isStringLiteral(first) ? first.text : 'pam');
      else if (depth === 0 && namedHelpers.has(name)) namedHelpers.get(name)!.forEach((r) => roles.add(r));
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return roles;
}

/** Keyset roles used by the `it` body, following calls of functions declared in the same file one level deep. Heuristic. */
export function rolesOfIt(file: ScannedFile, it: ItBlock): string[] {
  const helpers = new Map<string, Set<string>>();
  const collect = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name && node.body)
      helpers.set(node.name.text, rolesIn(node.body, new Map(), 1));
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      helpers.set(node.name.text, rolesIn(node.initializer, new Map(), 1));
    }
    ts.forEachChild(node, collect);
  };
  collect(file.source);
  return [...rolesIn(it.fn, helpers)].sort();
}

/** Names of the files (basenames) that appear as string literals inside a given `it`: how a test points at a sample file it runs. */
export function stringLiteralsOf(node: ts.Node): Set<string> {
  const out = new Set<string>();
  const visit = (n: ts.Node): void => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) out.add(n.text);
    ts.forEachChild(n, visit);
  };
  visit(node);
  return out;
}

export interface SnippetInfo {
  id: string;
  file: string;
  line: number;
  mode: Mode | 'invalid';
  /** Full Mocha title of the test that runs it (live and mocked). */
  test?: string;
  role?: string;
  owner: Owner;
  region: Region;
}

export interface SampleFileInfo {
  /** Repository relative path of the sample file. */
  file: string;
  /** Test (file + full title) that mentions the sample file by name. */
  test?: { file: string; title: string };
}

export interface TierScan {
  files: ScannedFile[];
  snippets: SnippetInfo[];
  samples: SampleFileInfo[];
}

/** Scans the whole tier once. Rules are applied by the callers. */
export function scanTier(list: Array<{ abs: string; kind: ScannedFile['kind'] }> = listFiles()): TierScan {
  const files = list.filter((f) => fs.existsSync(f.abs)).map((f) => scanFile(f.abs, f.kind));
  const snippets: SnippetInfo[] = [];
  const samples: SampleFileInfo[] = [];

  // Sample files run by a test: the test mentions the file name as a string literal inside an it().
  const runnerOf = (sample: ScannedFile): { file: string; it: ItBlock } | undefined => {
    const base = path.basename(sample.abs);
    for (const f of files) {
      if (f.kind === 'sample' || path.dirname(f.abs) !== path.dirname(sample.abs)) continue;
      for (const it of f.its) {
        if ([...stringLiteralsOf(it.fn)].some((s) => s === base || s.endsWith(`/${base}`))) return { file: f.rel, it };
      }
    }
    return undefined;
  };

  for (const f of files) {
    if (f.kind === 'sample') {
      const runner = runnerOf(f);
      samples.push({ file: f.rel, test: runner ? { file: runner.file, title: runner.it.fullTitle } : undefined });
      for (const region of f.regions) {
        snippets.push({
          id: region.id,
          file: f.rel,
          line: region.startLine,
          mode: runner ? 'live' : 'invalid',
          test: runner?.it.fullTitle,
          owner: { type: 'none', reason: 'sample file' },
          region,
        });
      }
      continue;
    }
    for (const region of f.regions) {
      const owner = resolveOwner(f, region);
      let mode: SnippetInfo['mode'] = 'invalid';
      let test: string | undefined;
      let role: string | undefined;
      if (owner.type === 'it') {
        mode = f.kind === 'mocked' ? 'mocked' : 'live';
        test = owner.it.fullTitle;
        const roles = rolesOfIt(f, owner.it);
        if (roles.length > 0) role = roles.join(',');
      } else if (owner.type === 'file-level') {
        mode = f.kind === 'mocked' ? 'mocked' : 'live';
        test = owner.it.fullTitle;
        const roles = rolesOfIt(f, owner.it);
        if (roles.length > 0) role = roles.join(',');
      } else if (owner.type === 'import-only') {
        mode = f.kind === 'mocked' ? 'mocked' : 'compile-only';
      } else if (owner.type === 'helper') {
        // The tests that call the helper run the snippet. The first caller names it.
        const caller = f.its.find((it) => callsName(it.fn, owner.name));
        if (caller) {
          mode = f.kind === 'mocked' ? 'mocked' : 'live';
          test = caller.fullTitle;
          const roles = rolesOfIt(f, caller);
          if (roles.length > 0) role = roles.join(',');
        }
      }
      snippets.push({ id: region.id, file: f.rel, line: region.startLine, mode, test, role, owner, region });
    }
  }
  return { files, snippets, samples };
}

export function callsName(node: ts.Node, name: string): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === name) found = true;
    else ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}
