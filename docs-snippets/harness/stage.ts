import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { allRewritableNames, isPlaceholder, isRegisteredName, placeholders, suffixName } from '../fixtures/names.js';
import { isVisibleLine, scanMarkers, type SnippetRegion } from './markers.js';

/**
 * Staging rewrite.
 *
 * Copies the suite into `docs-snippets/.run/<runId>/` and rewrites registered literals inside the visible part of snippet
 * regions.
 * Rewrites stay on the same line, so stack traces still point at the right line of the source file.
 * Hidden lines and everything outside the markers are left alone: authors use `world.n()` there.
 *
 * Why a staged copy at all. The docs embed the source files verbatim (EmbeddedCode fetches them from the repository), so
 * the source must show `my_channel`, not `my_channel-rk3x9q`. A live run needs unique names though, because two people or
 * two CI jobs share the keysets. The copy under `.run/<runId>/` is what Mocha executes. The original is never modified.
 *
 * Why the TypeScript compiler and not a regex. Only string literals in value position may change. A property name
 * (`{ channel: ... }`), an import path, a type literal or an option like `flags: 'a'` must stay. The AST tells them apart.
 */

/** Directories whose files may contain snippets and are rewritten. */
export const PAGE_DIRS = ['api-reference', 'shared', 'getting-started', 'migration-guides'];
// Everything the staged run imports. `quickstarts/` is absent on purpose: those sources are type checked only
// (tsconfig.browser.json) or not at all, because this repository cannot run a browser, React or React Native.
const COPY_DIRS = ['harness', 'fixtures', ...PAGE_DIRS];
const COPY_FILES = ['run.ts', 'package.json', 'tsconfig.live.json', 'tsconfig.run.json'];

/** Snippet ids whose `snippet.end` line is not at a statement position, so the ran marker went to the next statement. */
export interface RanFallback {
  id: string;
  file: string;
  line: number;
}

export interface Rewrite {
  file: string;
  line: number;
  from: string;
  to: string;
  kind: 'name' | 'placeholder';
}

export interface StageResult {
  runDir: string;
  runId: string;
  rewrites: Rewrite[];
  filesCopied: number;
  /** Registered names that no snippet region uses (they are legal, but worth a look). */
  unusedNames: string[];
  problems: string[];
  /** Ids whose `__snippetRan` call needed the AST fallback. */
  ranFallbacks: RanFallback[];
  /** Number of `snippet.end` lines that got a `__snippetRan` call. */
  ranMarkers: number;
  /** The mutated id, when DOCS_SNIPPETS_MUTATE was applied. */
  mutated?: string;
}

export interface StageOptions {
  /** DOCS_SNIPPETS_MUTATE: insert a throw right after this snippet's start marker in the staged copy. */
  mutate?: string;
}

/** Recursive copy that skips the directories a staged run must not contain: dependencies, other runs, reports. */
function copyDir(from: string, to: string, onFile: () => void): void {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.run' || entry.name === 'report') continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst, onFile);
    else {
      fs.copyFileSync(src, dst);
      onFile();
    }
  }
}

/** Rewrites one source text. Exposed for tests and the dry run. */
export function rewriteSource(text: string, file: string, runId: string): { text: string; rewrites: Rewrite[] } {
  const { regions } = scanMarkers(text);
  // No snippets, nothing to rewrite (shared helpers, fixtures). Skips parsing the file.
  if (regions.length === 0) return { text, rewrites: [] };
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const edits: Array<{ start: number; end: number; replacement: string; rewrite: Rewrite }> = [];

  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) && !isStructuralLiteral(node)) {
      const start = node.getStart(source);
      const { line: zeroLine } = source.getLineAndCharacterOfPosition(start);
      const line = zeroLine + 1;
      // Only literals on visible lines of a snippet. A multi-line template string is skipped because a rewrite must keep
      // the line count identical (stack traces and the compare tool rely on that).
      const region = regions.find((r) => isVisibleLine(r, line));
      if (region && !text.slice(start, node.end).includes('\n')) {
        const quote = text[start];
        const value = node.text;
        // Placeholder first: its literal is not a resource name, and it becomes a call, not a suffixed string.
        if (isPlaceholder(value)) {
          const replacement = `world.ph(${quote}${placeholders[value]}${quote})`;
          edits.push({ start, end: node.end, replacement, rewrite: { file, line, from: value, to: replacement, kind: 'placeholder' } });
        } else if (isRegisteredName(value)) {
          const suffixed = suffixName(value, runId);
          edits.push({
            start,
            end: node.end,
            replacement: `${quote}${suffixed}${quote}`,
            rewrite: { file, line, from: value, to: suffixed, kind: 'name' },
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  // Apply edits from the end of the file backwards, so earlier offsets stay valid while the text changes length.
  let out = text;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, edit.start) + edit.replacement + out.slice(edit.end);
  }
  return { text: out, rewrites: edits.map((e) => e.rewrite).sort((a, b) => a.line - b.line) };
}

// Option keys whose string values are never resource names, although the value may equal a registered name.
const NON_RESOURCE_KEYS = new Set(['flags', 'encoding']);

/** Property names, import paths and similar positions are never resource values. */
function isStructuralLiteral(node: ts.StringLiteral): boolean {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true;
  // Values of options that are never resource names, for example `fs.createWriteStream(path, { flags: 'a' })`. `a` is also a registered channel.
  if (ts.isPropertyAssignment(parent) && parent.initializer === node && ts.isIdentifier(parent.name) && NON_RESOURCE_KEYS.has(parent.name.text)) return true;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return true;
  if (ts.isLiteralTypeNode(parent)) return true;
  // The key inside an already staged `world.ph('key')` call is not a snippet literal (a key may equal its literal).
  if (ts.isCallExpression(parent) && parent.expression.getText().endsWith('world.ph')) return true;
  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === node) return false;
  return false;
}

/** Staging directories older than this are removed by the next stage. */
const STALE_STAGE_MS = 24 * 60 * 60 * 1000;

/**
 * Stages into `.run/<runId>/`, so two runs (a live run and a dry run, two agents, two CI jobs on one disk) never share
 * or delete each other's copy. Only this run's directory is replaced. Directories untouched for a day are pruned.
 */
export function stage(appDir: string, runId: string, options: StageOptions = {}): StageResult {
  const root = path.join(appDir, '.run');
  const runDir = path.join(root, runId);
  fs.mkdirSync(root, { recursive: true });
  pruneStale(root, runId);
  fs.rmSync(runDir, { recursive: true, force: true });
  fs.mkdirSync(runDir, { recursive: true });

  let filesCopied = 0;
  const bump = (): void => {
    filesCopied += 1;
  };
  for (const dir of COPY_DIRS) {
    const from = path.join(appDir, dir);
    if (fs.existsSync(from)) copyDir(from, path.join(runDir, dir), bump);
  }
  for (const file of COPY_FILES) {
    const from = path.join(appDir, file);
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, path.join(runDir, file));
      bump();
    }
  }

  const rewrites: Rewrite[] = [];
  const problems: string[] = [];
  for (const dir of PAGE_DIRS) {
    const root = path.join(runDir, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))) {
      const relative = path.relative(runDir, file);
      const original = fs.readFileSync(file, 'utf8');
      const result = rewriteSource(original, relative, runId);
      if (result.rewrites.length === 0) continue;
      // Safety net for the rewrite: the staged file must still parse and keep the same number of lines, otherwise a
      // failing step would point at a different line than the source file the author edits.
      if (result.text.split('\n').length !== original.split('\n').length) {
        problems.push(`${relative}: rewrite changed the line count`);
      }
      const diagnostics = ts.transpileModule(result.text, {
        reportDiagnostics: true,
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).diagnostics;
      for (const d of diagnostics ?? []) {
        problems.push(`${relative}: staged file does not parse: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
      }
      fs.writeFileSync(file, result.text);
      rewrites.push(...result.rewrites);
    }
  }

  // Second pass as a self-check. Running the rewrite on already staged text must find nothing: a hit means a registered
  // literal escaped the first pass (for example inside a construct the visitor skipped).
  // Verify: no registered literal is left unrewritten inside a visible snippet region of the staged tree.
  for (const dir of PAGE_DIRS) {
    const root = path.join(runDir, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root).filter((f) => f.endsWith('.ts'))) {
      const relative = path.relative(runDir, file);
      const text = fs.readFileSync(file, 'utf8');
      const leftover = rewriteSource(text, relative, runId).rewrites;
      // After one pass, rewriting again finds only literals that were not suffixed (the suffixed form is not registered).
      for (const l of leftover) problems.push(`${relative}:${l.line}: "${l.from}" is still unrewritten after staging`);
    }
  }

  // Names registered in fixtures/names.ts that no snippet uses. Legal (harness steps may use them), shown so the registry stays tidy.
  const used = new Set(rewrites.filter((r) => r.kind === 'name').map((r) => r.from));
  const unusedNames = allRewritableNames().filter((name) => !used.has(name));

  // Honesty markers, after all marker parsing and rewriting: every snippet region inside a step() body records that its last
  // line ran (`__snippetRan('<id>')` on the `snippet.end` line), and DOCS_SNIPPETS_MUTATE breaks one snippet on purpose.
  // Both edits stay on their line, so line numbers still match the source.
  const ranFallbacks: RanFallback[] = [];
  let ranMarkers = 0;
  let mutated: string | undefined;
  for (const dir of PAGE_DIRS) {
    const root = path.join(runDir, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root).filter((f) => f.endsWith('.ts'))) {
      const relative = path.relative(runDir, file);
      const text = fs.readFileSync(file, 'utf8');
      const result = instrumentSource(text, relative, options.mutate);
      if (result.text === text) continue;
      ranMarkers += result.marked;
      ranFallbacks.push(...result.fallbacks.map((f) => ({ ...f, file: relative })));
      if (result.mutated) mutated = result.mutated;
      problems.push(...result.problems.map((p) => `${relative}: ${p}`));
      fs.writeFileSync(file, result.text);
    }
  }
  if (options.mutate && !mutated) problems.push(`DOCS_SNIPPETS_MUTATE=${options.mutate}: no snippet with that id inside a step() body`);

  // `pubnub` for child processes and scratch projects (the module format check, the Node quickstart, the TypeScript project
  // checks). They run plain Node or tsc below this directory, so they resolve `pubnub` the way a user project does, through
  // node_modules. The link points at this repository, whose package.json `main` is lib/node/index.js. Nothing is installed.
  const modules = path.join(runDir, 'node_modules');
  fs.mkdirSync(modules, { recursive: true });
  fs.symlinkSync(path.resolve(appDir, '..'), path.join(modules, 'pubnub'), 'dir');

  // A record of every rewrite for humans debugging a live failure (`.run/<runId>/stage-manifest.json`).
  fs.writeFileSync(
    path.join(runDir, 'stage-manifest.json'),
    JSON.stringify({ runId, generatedAt: new Date().toISOString(), rewrites }, null, 2),
  );
  return { runDir, runId, rewrites, filesCopied, unusedNames, problems, ranFallbacks, ranMarkers, mutated };
}

/** True when the text parses as a module (the staged files must stay valid TypeScript). */
function parses(text: string): string[] {
  const diagnostics = ts.transpileModule(text, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).diagnostics;
  return (diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '));
}

/** Ids of regions that sit inside a `step()` callback (not check, not stub, not import-only). */
function stepRegions(text: string, file: string): SnippetRegion[] {
  const { regions } = scanMarkers(text);
  if (regions.length === 0) return [];
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const spans: Array<[number, number]> = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'step') {
      const fn = [...node.arguments].reverse().find((a) => ts.isArrowFunction(a) || ts.isFunctionExpression(a));
      if (fn) spans.push([source.getLineAndCharacterOfPosition(fn.getStart(source)).line + 1, source.getLineAndCharacterOfPosition(fn.end).line + 1]);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return regions.filter((r) => r.explicitEnd && spans.some(([a, b]) => r.startLine >= a && r.endLine <= b));
}

/**
 * Finds where to put a statement for a marker line that is not at a statement position: right after the innermost statement
 * that contains the line, so it runs once that statement finished. Returns an offset in `text`, or undefined.
 */
function afterEnclosingStatement(text: string, file: string, line: number): number | undefined {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  const position = source.getPositionOfLineAndCharacter(line - 1, 0);
  let best: ts.Statement | undefined;
  const visit = (node: ts.Node): void => {
    if (node.getFullStart() > position || node.end < position) return;
    const parent = node.parent;
    const inList = parent && (ts.isBlock(parent) || ts.isSourceFile(parent) || ts.isCaseClause(parent) || ts.isDefaultClause(parent) || ts.isModuleBlock(parent));
    if (inList && node.getStart(source) <= position && node.end >= position) best = node as ts.Statement;
    ts.forEachChild(node, visit);
  };
  visit(source);
  return best?.end;
}

/**
 * Adds `__snippetRan('<id>')` to the `snippet.end` line of every region inside a step body, and with `mutate` a throw at
 * the start marker of that id. Same line, so line numbers stay. When the plain edit does not parse (the marker sits inside an
 * expression), the call goes after the enclosing statement instead, and the id is listed as a fallback.
 */
export function instrumentSource(
  text: string,
  file: string,
  mutate?: string,
): { text: string; marked: number; fallbacks: Array<{ id: string; line: number }>; mutated?: string; problems: string[] } {
  const regions = stepRegions(text, file);
  const fallbacks: Array<{ id: string; line: number }> = [];
  const problems: string[] = [];
  let mutated: string | undefined;
  let lines = text.split('\n');
  // From the bottom up, so earlier line numbers stay valid while lines change.
  for (const region of [...regions].sort((a, b) => b.endLine - a.endLine)) {
    const call = `__snippetRan('${region.id}');`;
    const plain = [...lines];
    plain[region.endLine - 1] = plain[region.endLine - 1].replace(/^(\s*)/, `$1${call} `);
    if (parses(plain.join('\n')).length === 0) {
      lines = plain;
    } else {
      const current = lines.join('\n');
      const offset = afterEnclosingStatement(current, file, region.endLine);
      if (offset === undefined) {
        problems.push(`no statement position for __snippetRan('${region.id}') near line ${region.endLine}`);
        continue;
      }
      const edited = `${current.slice(0, offset)} ${call}${current.slice(offset)}`;
      const errors = parses(edited);
      if (errors.length > 0) {
        problems.push(`__snippetRan('${region.id}') does not parse after the fallback: ${errors[0]}`);
        continue;
      }
      lines = edited.split('\n');
      fallbacks.push({ id: region.id, line: region.endLine });
    }
  }
  // `__snippetStart('<id>')` on the start marker line: the honesty check counts only assertions made after the docs code began.
  for (const region of [...regions].sort((x, y) => y.startLine - x.startLine)) {
    const plain = [...lines];
    plain[region.startLine - 1] = plain[region.startLine - 1].replace(/^(\s*)/, `$1__snippetStart('${region.id}'); `);
    if (parses(plain.join('\n')).length === 0) lines = plain;
    else problems.push(`__snippetStart('${region.id}') is not at a statement position`);
  }
  if (mutate) {
    const region = regions.find((r) => r.id === mutate);
    if (region) {
      const throwLine = `throw new Error('DOCS_SNIPPETS_MUTATE ${mutate}');`;
      const plain = [...lines];
      plain[region.startLine - 1] = plain[region.startLine - 1].replace(/^(\s*)/, `$1${throwLine} `);
      if (parses(plain.join('\n')).length === 0) {
        lines = plain;
        mutated = mutate;
      } else {
        problems.push(`DOCS_SNIPPETS_MUTATE=${mutate}: the start marker is not at a statement position`);
      }
    }
  }
  return { text: lines.join('\n'), marked: regions.length - problems.filter((p) => p.startsWith('no statement') || p.includes('after the fallback')).length, fallbacks, mutated, problems };
}

function pruneStale(root: string, keep: string): void {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === keep) continue;
    const full = path.join(root, entry.name);
    try {
      if (Date.now() - fs.statSync(full).mtimeMs > STALE_STAGE_MS) fs.rmSync(full, { recursive: true, force: true });
    } catch {
      // Another run removed it first.
    }
  }
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
