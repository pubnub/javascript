/**
 * Marker lint of the live tier. Static, no keys, no network.
 *
 *   npx tsx test/integration/live/support/lint-markers.ts            (npm run test:integration:live:lint runs it)
 *
 * Scans every `*.test.ts` and sample file under test/integration/live/ plus the mocked allow-list of snippet-scan.ts.
 *
 * Marker rules (the docs extractor, documentation/src/helper/codeSnippetFetcher.ts, defines what a marker is):
 *   M1  marker syntax: `// snippet.<id>`, `// snippet.end`, `// snippet.hide`, `// snippet.show`, with the space after the
 *       slashes, id charset [a-zA-Z0-9_-] (one known id with "/" is a warning, see snippet-scan.ts)
 *   M2  every snippet has snippet.end; no start marker inside an open snippet (the extractor would cut the outer one)
 *   M3  snippet.hide has snippet.show; a hidden block has at most MAX_HIDDEN_LINES lines and holds code
 *   M4  an id appears once in the tier (one file, one place): the docs address a snippet by file + id
 *   M5  a snippet is not empty
 *   M6  no test-only code in the visible text (assert, expect, eventually, watch, anything imported from ./support or
 *       node:assert)
 *   M7  no try/catch and no console.error in the visible text, except the ids in ERROR_HANDLING_SNIPPETS
 * Honesty rules (replace the run-time injection of the old harness):
 *   H1  a snippet runs inside an it() callback (or a named helper that an it() calls), or is an import-only snippet at the
 *       top of a test file (mode compile-only)
 *   H2  the it() has an assertion call after the snippet's end line (assert*, rejects*, expect*, eventually), or the snippet
 *       sits in a helper that asserts after it, or the it() carries `// lint: asserted-via <helper>` (listed in the output)
 *   H3  no `return` that belongs to the function holding the snippet inside the snippet (it could skip the rest)
 *   H4  a snippet is not in a skipped it() or describe()
 *   H5  a sample file with markers is run by a test (a test mentions its file name)
 * Warnings (do not fail): the slash id; an it() title that does not name its snippet ids; an unused allow-list entry.
 */
import ts from 'typescript';
import {
  callsName,
  isVisibleLine,
  scanTier,
  type Issue,
  type ItBlock,
  type Region,
  type ScannedFile,
  type SnippetInfo,
  type TierScan,
} from './snippet-scan';

/** Hidden blocks hold a single line of live configuration (a key spread, a type suppression). */
export const MAX_HIDDEN_LINES = 3;

/**
 * Snippets whose whole purpose is to show try/catch around a call, as the docs pages do (M7 does not apply to them). Ported
 * from the old harness. Every other snippet lets errors throw, so a failed call fails the test. Keep this list short.
 */
export const ERROR_HANDLING_SNIPPETS: ReadonlySet<string> = new Set([
  'publishHandleErrors',
  'grantTokenSpacesBasicUsage',
  'grantTokenSpacesVariousResources',
  'grantTokenSpacesRegEx',
  'grantTokenSpacesRegExAndResources',
  'historyBasicUsage',
  'historyOldestThree',
  'historyNewerThanTimetoken',
  'historyUntilTimetoken',
  'historyIncludeMeta',
  'quickstartNodePublish',
]);

/**
 * Folders (relative to live/) whose samples are application code that the use-case pages show with their own error handling
 * (try/catch around each call, console.error). M7 does not apply there. The old harness never linted use-cases/ (its scan
 * list was api-reference, shared, getting-started, migration-guides), so this is a new decision, not a port: the
 * protection against a swallowed error is rule H2 (an assertion on the effect after the snippet).
 */
export const ERROR_HANDLING_FOLDERS: readonly string[] = ['use-cases/'];

const TEST_ONLY_NAMES = ['assert', 'expect', 'eventually', 'watch', 'expectEvent', 'expectStatus'];
const ASSERTION_NAME = /^(assert\w*|rejects\w*|expect\w*)$/;
const ESCAPE = /^\s*\/\/\s*lint:\s*asserted-via\s+([A-Za-z_$][\w$]*)\s*$/;

export interface LintResult {
  errors: Issue[];
  warnings: Issue[];
  /** Every use of the `lint: asserted-via` escape and every hidden type suppression: reported, never silent. */
  notes: string[];
  files: number;
  snippets: number;
  scan: TierScan;
}

function leftmost(expr: ts.Expression): ts.Expression {
  let e = expr;
  while (true) {
    if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) e = e.expression;
    else if (ts.isCallExpression(e)) e = e.expression;
    else if (ts.isNonNullExpression(e) || ts.isParenthesizedExpression(e) || ts.isAwaitExpression(e)) e = e.expression;
    else return e;
  }
}

/** Is `call` an assertion by name: assert.x(), assertFoo(), expect(...).…, expectEvent(), rejectsX(), eventually(). */
export function isAssertionCall(call: ts.CallExpression): boolean {
  const callee = call.expression;
  const root = leftmost(callee);
  if (ts.isIdentifier(root) && (root.text === 'assert' || root.text === 'expect')) return true;
  const name = ts.isIdentifier(callee)
    ? callee.text
    : ts.isPropertyAccessExpression(callee)
      ? callee.name.text
      : undefined;
  if (name === undefined) return false;
  return ASSERTION_NAME.test(name) || name === 'eventually';
}

/**
 * Variables of `node` initialised by an assertion call (`const back = expectStatus(...)`): the assertion is armed there and
 * fires when the variable is awaited later. Returns their names.
 */
function armedAssertions(node: ts.Node): Set<string> {
  const names = new Set<string>();
  const visit = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) {
      const init = ts.isAwaitExpression(n.initializer) ? n.initializer.expression : n.initializer;
      if (ts.isCallExpression(init) && isAssertionCall(init)) names.add(n.name.text);
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return names;
}

/**
 * First line (1-based) of an assertion that runs after `afterLine` inside `node`: a call of assert*, rejects*, expect*,
 * eventually, or an `await` of a variable that an earlier assertion call armed (`const back = expectStatus(...)` ... `await back`).
 */
function assertionAfter(file: ScannedFile, node: ts.Node, afterLine: number): number | undefined {
  let found: number | undefined;
  const armed = armedAssertions(node);
  const visit = (n: ts.Node): void => {
    if (found !== undefined) return;
    if (ts.isCallExpression(n) && isAssertionCall(n)) {
      const line = file.lineOf(n.getStart(file.source));
      if (line > afterLine) {
        found = line;
        return;
      }
    }
    if (ts.isAwaitExpression(n) && armed.size > 0) {
      const line = file.lineOf(n.getStart(file.source));
      let uses = false;
      const look = (m: ts.Node): void => {
        if (ts.isIdentifier(m) && armed.has(m.text)) uses = true;
        else ts.forEachChild(m, look);
      };
      look(n.expression);
      if (uses && line > afterLine) {
        found = line;
        return;
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/** Line of the first call of `name` inside `node`. */
function firstCallLine(file: ScannedFile, node: ts.Node, name: string): number | undefined {
  let found: number | undefined;
  const visit = (n: ts.Node): void => {
    if (found !== undefined) return;
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === name) {
      found = file.lineOf(n.getStart(file.source));
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

function importedTestOnlyNames(file: ScannedFile): Set<string> {
  const names = new Set<string>(TEST_ONLY_NAMES);
  for (const s of file.source.statements) {
    if (!ts.isImportDeclaration(s) || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    const spec = s.moduleSpecifier.text;
    if (!/(^|\/)support(\/|$)/.test(spec) && !/^(node:)?assert(\/strict)?$/.test(spec)) continue;
    const clause = s.importClause;
    if (!clause) continue;
    if (clause.name) names.add(clause.name.text);
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) names.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) bindings.elements.forEach((e) => names.add(e.name.text));
  }
  return names;
}

function isNamePosition(node: ts.Identifier): boolean {
  const p = node.parent;
  return (
    (ts.isPropertyAccessExpression(p) && p.name === node) ||
    (ts.isPropertyAssignment(p) && p.name === node) ||
    (ts.isBindingElement(p) && p.propertyName === node) ||
    (ts.isPropertySignature(p) && p.name === node) ||
    (ts.isMethodDeclaration(p) && p.name === node) ||
    (ts.isShorthandPropertyAssignment(p) && false)
  );
}

function enclosingFunction(node: ts.Node): ts.Node | undefined {
  for (let p = node.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return p;
  return undefined;
}

function checkRegion(
  file: ScannedFile,
  snippet: SnippetInfo,
  region: Region,
  add: (line: number, msg: string) => void,
  warn: (line: number, msg: string) => void,
  notes: string[],
  usedAllow: Set<string>,
): void {
  const lines = file.text.split('\n');
  const { source, lineOf } = file;

  // M3 hidden blocks.
  for (const block of region.hidden) {
    if (block.showLine === undefined) continue;
    const body = lines.slice(block.hideLine, block.showLine - 1);
    const count = body.length;
    if (count > MAX_HIDDEN_LINES)
      add(block.hideLine, `hidden block in "${region.id}" has ${count} lines, maximum is ${MAX_HIDDEN_LINES}`);
    const code = body
      .join('\n')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
      .trim();
    if (body.join('').trim() === '') add(block.hideLine, `hidden block in "${region.id}" is empty`);
    else if (code === '') {
      if (/^\s*\/\/\s*@ts-expect-error\b/.test(body.find((l) => l.trim() !== '') ?? '') && count === 1) {
        notes.push(`hidden @ts-expect-error: ${file.rel}:${block.hideLine} (${region.id})`);
      } else
        add(block.hideLine, `hidden block in "${region.id}" holds only comments: hiding text the reader should see`);
    }
  }

  // M5 empty.
  const visible = lines.filter((_, i) => isVisibleLine(region, i + 1));
  if (visible.every((l) => l.trim() === ''))
    add(region.startLine, `snippet "${region.id}" is empty: no visible line between its markers`);

  // M6 and M7: walk the file, look at nodes that start on a visible line of this region.
  const testOnly = importedTestOnlyNames(file);
  const allowTry =
    ERROR_HANDLING_SNIPPETS.has(region.id) ||
    ERROR_HANDLING_FOLDERS.some((f) => file.rel.startsWith(`test/integration/live/${f}`));
  let sawTry = false;
  const visit = (node: ts.Node): void => {
    const start = lineOf(node.getStart(source));
    const visibleHere = isVisibleLine(region, start);
    if (visibleHere) {
      if (
        ts.isIdentifier(node) &&
        testOnly.has(node.text) &&
        !isNamePosition(node) &&
        !ts.isImportSpecifier(node.parent)
      ) {
        add(start, `test-only code in visible text of "${region.id}": \`${node.text}\``);
      }
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        /(^|\/)support(\/|$)/.test(node.moduleSpecifier.text)
      ) {
        add(start, `test-only import from "${node.moduleSpecifier.text}" in visible text of "${region.id}"`);
      }
      if (ts.isTryStatement(node)) {
        sawTry = true;
        if (!allowTry)
          add(
            start,
            `try/catch inside snippet "${region.id}" (a snippet lets errors throw; allow-list: ERROR_HANDLING_SNIPPETS in lint-markers.ts)`,
          );
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'console' &&
        node.expression.name.text === 'error'
      ) {
        sawTry = true;
        if (!allowTry)
          add(
            start,
            `console.error inside snippet "${region.id}" (a snippet lets errors throw; allow-list: ERROR_HANDLING_SNIPPETS in lint-markers.ts)`,
          );
      }
    }
    if (start <= region.endLine) ts.forEachChild(node, visit);
  };
  visit(source);
  if (sawTry) usedAllow.add(region.id);

  // H1 to H4 by owner.
  const owner = snippet.owner;
  if (owner.type === 'none') {
    if (file.kind === 'sample') {
      if (snippet.mode === 'invalid')
        add(
          region.startLine,
          `snippet "${region.id}" is in a sample file that no test runs (no it() in the same folder mentions its file name)`,
        );
    } else add(region.startLine, `snippet "${region.id}" ${owner.reason}`);
    return;
  }
  if (owner.type === 'import-only') return;
  if (owner.type === 'file-level-error') {
    add(owner.line, owner.message);
    return;
  }
  if (owner.type === 'file-level') {
    // The named it() must assert something at all; that it asserts THIS sample's effect is the author's claim, printed as a note.
    if (assertionAfter(file, owner.it.fn, owner.it.startLine - 1) === undefined)
      add(owner.line, `\`lint: asserted-by ${owner.needle}\`: the test "${owner.it.title}" has no assertion call`);
    else
      notes.push(`asserted-by "${owner.needle}": ${file.rel}:${owner.line} (${region.id}) -> "${owner.it.fullTitle}"`);
    return;
  }

  const fn = owner.type === 'it' ? owner.it.fn : owner.fn;
  // H3: a return that belongs to the function holding the snippet.
  const returns: number[] = [];
  const findReturns = (node: ts.Node): void => {
    if (ts.isReturnStatement(node)) {
      const l = lineOf(node.getStart(source));
      if (l > region.startLine && l < region.endLine && enclosingFunction(node) === fn) returns.push(l);
    }
    if (node !== fn && ts.isFunctionLike(node)) return;
    ts.forEachChild(node, findReturns);
  };
  if (fn.body) ts.forEachChild(fn.body, findReturns);
  returns.forEach((l) =>
    add(l, `return inside snippet "${region.id}" can skip the rest of the test (the assertions after it)`),
  );

  if (owner.type === 'it') {
    const it = owner.it;
    if (it.skipped) add(region.startLine, `snippet "${region.id}" sits in a skipped test ("${it.fullTitle}")`);
    checkAssertion(file, it, region, add, notes);
  } else {
    // A named helper: it must be called by an it(), and the assertion comes from the helper or from the caller.
    const callers = file.its.filter((it) => callsName(it.fn, owner.name));
    if (callers.length === 0) {
      add(region.startLine, `snippet "${region.id}" is in helper ${owner.name}() that no it() calls`);
      return;
    }
    if (assertionAfter(file, owner.fn, region.endLine) !== undefined) return;
    for (const it of callers) {
      const callLine = firstCallLine(file, it.fn, owner.name) ?? it.startLine;
      if (assertionAfter(file, it.fn, callLine) === undefined && !escapeOf(file, it, region, notes, add)) {
        add(
          region.startLine,
          `snippet "${region.id}" runs in helper ${owner.name}() but no assertion follows its call in "${it.fullTitle}" (add one, or \`// lint: asserted-via <helper>\`)`,
        );
      }
    }
  }
  // The title convention is the live tier's; the mocked tests outside it keep their own titles.
  if (file.kind !== 'mocked' && titleLacksId(snippet, owner)) {
    warn(
      region.startLine,
      `title of the test "${owner.type === 'it' ? owner.it.title : ''}" does not start with its snippet id "${region.id}" (README convention)`,
    );
  }
}

function titleLacksId(snippet: SnippetInfo, owner: SnippetInfo['owner']): boolean {
  return owner.type === 'it' && !owner.it.title.includes(snippet.id);
}

function escapeOf(
  file: ScannedFile,
  it: ItBlock,
  region: Region,
  notes: string[],
  add: (line: number, msg: string) => void,
): boolean {
  const lines = file.text.split('\n');
  for (let l = Math.max(region.endLine, it.startLine); l <= it.endLine; l++) {
    const m = ESCAPE.exec(lines[l - 1] ?? '');
    if (!m) continue;
    const helper = m[1];
    const callLine = firstCallLine(file, it.fn, helper);
    if (callLine === undefined || callLine <= region.endLine) {
      add(
        l,
        `\`lint: asserted-via ${helper}\` names a helper that is not called after the end of "${region.id}" in this test`,
      );
      return true;
    }
    notes.push(`asserted-via ${helper}: ${file.rel}:${l} (${region.id})`);
    return true;
  }
  return false;
}

function checkAssertion(
  file: ScannedFile,
  it: ItBlock,
  region: Region,
  add: (line: number, msg: string) => void,
  notes: string[],
): void {
  if (assertionAfter(file, it.fn, region.endLine) !== undefined) return;
  if (escapeOf(file, it, region, notes, add)) return;
  add(
    region.endLine,
    `no assertion after snippet "${region.id}" in "${it.title}" (assert*, rejects*, expect*, eventually() after line ${region.endLine}; or \`// lint: asserted-via <helper>\`)`,
  );
}

export function lintTier(scan: TierScan = scanTier()): LintResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const notes: string[] = [];
  const usedAllow = new Set<string>();
  const seen = new Map<string, string>();

  for (const file of scan.files) {
    errors.push(...file.problems);
    warnings.push(...file.warnings);
    const mine = scan.snippets.filter((s) => s.file === file.rel);
    for (const snippet of mine) {
      const { region } = snippet;
      const add = (line: number, message: string): void => void errors.push({ file: file.rel, line, message });
      const warn = (line: number, message: string): void => void warnings.push({ file: file.rel, line, message });
      // M4
      const previous = seen.get(region.id);
      if (previous)
        add(
          region.startLine,
          `duplicate snippet id "${region.id}" (also at ${previous}): the docs address a snippet by file and id, keep one tested copy`,
        );
      else seen.set(region.id, `${file.rel}:${region.startLine}`);
      checkRegion(file, snippet, region, add, warn, notes, usedAllow);
    }
  }
  // Allow-list hygiene: an entry whose snippet exists but has no try/console.error any more.
  const present = new Set(scan.snippets.map((s) => s.id));
  for (const id of ERROR_HANDLING_SNIPPETS) {
    if (present.has(id) && !usedAllow.has(id)) {
      warnings.push({
        file: 'support/lint-markers.ts',
        line: 0,
        message: `ERROR_HANDLING_SNIPPETS lists "${id}" but its visible text has no try/catch or console.error: drop it from the list`,
      });
    }
  }
  const order = (a: Issue, b: Issue): number => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1);
  errors.sort(order);
  warnings.sort(order);
  return { errors, warnings, notes, files: scan.files.length, snippets: scan.snippets.length, scan };
}

export function printLint(result: LintResult): void {
  for (const w of result.warnings) console.warn(`warning ${w.file}:${w.line}  ${w.message}`);
  for (const n of result.notes) console.log(`note: ${n}`);
  if (result.errors.length === 0) {
    console.log(
      `marker lint ok: ${result.files} files, ${result.snippets} snippets, ${result.warnings.length} warning(s).`,
    );
    return;
  }
  for (const e of result.errors) console.error(`${e.file}:${e.line}  ${e.message}`);
  console.error(
    `marker lint failed: ${result.errors.length} problem(s) in ${result.files} files (${result.snippets} snippets).`,
  );
}

if (require.main === module) {
  const result = lintTier();
  printLint(result);
  process.exitCode = result.errors.length === 0 ? 0 : 1;
}
