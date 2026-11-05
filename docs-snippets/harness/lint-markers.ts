import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { isPlaceholder, isRegisteredName, PLACEHOLDER_LOOKALIKE } from '../fixtures/names.js';
import { isInsideRegion, isVisibleLine, scanMarkers, type SnippetRegion } from './markers.js';

/**
 * Marker lint. Snippets let errors throw, so `try`,
 * `catch` and `console.error` inside a snippet are errors too.
 *
 * Rules:
 *  1. id matches ^[A-Za-z0-9_-]+$ and is unique across the suite
 *  2. no nested start marker, every snippet has snippet.end
 *  3. snippet.hide has a snippet.show, at most 3 lines per hidden block, and hidden lines only hold
 *     in-scope asserts or live configuration (they must hold `world.` or `assert(` as code, comments do not count,
 *     except one `@ts-expect-error` line that is listed in the output)
 *  4. a snippet sits inside a step() callback, except import-only snippets at module top level
 *  5. a step id is one of the snippet ids it contains, `snippets` equals the markers inside,
 *     check() and stub() contain none
 *  6. resource-like string literals inside a snippet are in fixtures/names.ts, placeholder-like literals are
 *     registered placeholders
 *  7. no try, catch or console.error inside a snippet (except the ids in ERROR_HANDLING_SNIPPETS)
 */

// Role: the static gate. It runs without keys or network (step 2 of `npm run test:docs-snippets:dry` and a gate before every
// live run) and guarantees the invariants the docs and the stage rewrite depend on: a snippet is a clean, embeddable
// region inside a step, with registered literals.
//
// A slash is allowed because the docs embed `simpleNotificationPayloadFCMandAPNSH/2`. The docs extractor
// matches the requested id literally, so it works there.
const ID = /^[A-Za-z0-9_/-]+$/;
const MAX_HIDDEN_LINES = 3;
/**
 * Snippets whose whole purpose is to show try/catch and console.error (the publish error handling sample).
 * Rule 7 does not apply to these ids. Keep this list short: every other snippet lets errors throw.
 */
const ERROR_HANDLING_SNIPPETS = new Set([
  'publishHandleErrors',
  // The pages show these calls inside try and catch. A hidden world.keep() at the end of the try hands the result to the
  // step, and world.take() fails the step when the catch ran (harness/world.ts), so a swallowed error cannot pass.
  'grantTokenSpacesBasicUsage', 'grantTokenSpacesVariousResources', 'grantTokenSpacesRegEx', 'grantTokenSpacesRegExAndResources',
  'historyBasicUsage', 'historyOldestThree', 'historyNewerThanTimetoken', 'historyUntilTimetoken', 'historyIncludeMeta',
  'quickstartNodePublish',
]);
/** Directory of standalone quickstart snippet sources, see the end of lintApp. */
const STANDALONE_DIR = 'quickstarts';
const SCAN_DIRS = ['api-reference', 'shared', 'getting-started', 'migration-guides'];
const RESOURCE_KEYS = new Set(['channel', 'channelGroup', 'uuid', 'userId', 'id', 'device', 'channelId', 'spaceId', 'entityAId', 'entityBId']);
const RESOURCE_ARRAY_KEYS = new Set(['channels', 'channelGroups', 'uuids', 'userIds']);
const RESOURCE_CALLS = new Set([
  'channel',
  'channelGroup',
  'channelMetadata',
  'userMetadata',
  'setUserId',
  'dataSyncUser',
  'dataSyncChannel',
  'dataSyncEntity',
  'dataSyncRelationship',
  'dataSyncMembership',
]);

/** One lint finding. `line` is 1-based in `file` (relative to the suite directory). */
export interface LintIssue {
  file: string;
  line: number;
  message: string;
}

/** `snippets` lists every region found (its step, or `importOnly` for module-level imports), the dry run compares it with the registry. */
export interface LintResult {
  errors: LintIssue[];
  files: number;
  snippets: Array<{ id: string; file: string; step?: string; importOnly: boolean }>;
  steps: number;
  /** Hidden type suppressions that the rule allows, listed so they stay visible. */
  suppressions: string[];
}

// A `step()`, `check()` or `stub()` call found in the AST, with the line span of its callback. Snippet regions are matched to
// the call whose span contains them.
interface StepCall {
  kind: 'step' | 'check' | 'stub';
  id: string;
  startLine: number;
  endLine: number;
  declared?: string[];
}

/** Scans every page directory and the standalone quickstart sources. Pure file reads, safe to call from the dry run and the CLI. */
export function lintApp(appDir: string): LintResult {
  const errors: LintIssue[] = [];
  const snippets: LintResult['snippets'] = [];
  const seen = new Map<string, string>();
  const suppressions: string[] = [];
  let files = 0;
  let steps = 0;

  for (const dir of SCAN_DIRS) {
    const root = path.join(appDir, dir);
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root).filter((f) => /\.tsx?$/.test(f))) {
      files += 1;
      const rel = path.relative(appDir, file);
      const text = fs.readFileSync(file, 'utf8');
      const add = (line: number, message: string): void => {
        errors.push({ file: rel, line, message });
      };
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
      const lineOf = (pos: number): number => source.getLineAndCharacterOfPosition(pos).line + 1;
      const { regions, problems } = scanMarkers(text);
      problems.forEach((p) => add(p.line, p.message));

      // Collect step(), check() and stub() calls. The callback is the last function argument, so both the `(id, fn)` and
      // `(id, options, fn)` overloads work. Only string-literal ids count: a computed id could not be matched to markers.
      const calls: StepCall[] = [];
      const collect = (node: ts.Node): void => {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          const name = node.expression.text;
          if ((name === 'step' || name === 'check' || name === 'stub') && node.arguments.length > 0) {
            const first = node.arguments[0];
            const fn = [...node.arguments].reverse().find((a) => ts.isArrowFunction(a) || ts.isFunctionExpression(a));
            if (ts.isStringLiteral(first)) {
              let declared: string[] | undefined;
              const options = node.arguments[1];
              if (options && ts.isObjectLiteralExpression(options)) {
                for (const prop of options.properties) {
                  if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'snippets' && ts.isArrayLiteralExpression(prop.initializer)) {
                    declared = prop.initializer.elements.filter(ts.isStringLiteral).map((e) => e.text);
                  }
                }
              }
              calls.push({
                kind: name,
                id: first.text,
                startLine: fn ? lineOf(fn.getStart(source)) : lineOf(node.getStart(source)),
                endLine: fn ? lineOf(fn.end) : lineOf(node.end),
                declared,
              });
            }
          }
        }
        ts.forEachChild(node, collect);
      };
      collect(source);
      steps += calls.filter((c) => c.kind === 'step').length;

      // An import-only snippet (`importPubNub`) is allowed at module level because an import cannot sit inside a function.
      const topLevelOnlyImports = (region: SnippetRegion): boolean => {
        const inside = source.statements.filter((s) => {
          const l = lineOf(s.getStart(source));
          return isInsideRegion(region, l);
        });
        return inside.length > 0 && inside.every(ts.isImportDeclaration);
      };

      const containing = new Map<StepCall, string[]>();
      for (const region of regions) {
        // Rule 1.
        if (!ID.test(region.id)) add(region.startLine, `snippet id "${region.id}" does not match ${ID}`);
        const previous = seen.get(region.id);
        if (previous) add(region.startLine, `duplicate snippet id "${region.id}" (also in ${previous})`);
        else seen.set(region.id, `${rel}:${region.startLine}`);

        // Rule 3.
        for (const block of region.hidden) {
          if (block.showLine === undefined) continue;
          const lines = block.showLine - block.hideLine - 1;
          if (lines > MAX_HIDDEN_LINES) {
            add(block.hideLine, `hidden block in "${region.id}" has ${lines} lines, maximum is ${MAX_HIDDEN_LINES}`);
          }
          const body = text.split('\n').slice(block.hideLine, block.showLine - 1).join('\n');
          // Comment text does not count: a comment that merely contains the word "assert" used to pass this rule.
          const code = stripComments(body);
          if (isTypeSuppression(body)) {
            // The one documented exception: a single `@ts-expect-error` line for a property the shipped types lack.
            // `@ts-expect-error` (not `@ts-ignore`) stops compiling when the SDK types are fixed, which removes the hole.
            suppressions.push(`${rel}:${block.hideLine} (${region.id})`);
          } else if (!/\bworld\.|\bassert\s*[.(]/.test(code)) {
            add(block.hideLine, `hidden block in "${region.id}" must hold an in-scope assert or live configuration as code (world.* or assert(...)), comments do not count`);
          }
        }

        // Rule 4.
        const owner = calls.find((c) => region.startLine >= c.startLine && region.endLine <= c.endLine);
        let importOnly = false;
        if (!owner) {
          if (topLevelOnlyImports(region)) importOnly = true;
          else add(region.startLine, `snippet "${region.id}" is not inside a step() callback (only import-only snippets may sit at module level)`);
        } else {
          const list = containing.get(owner) ?? [];
          list.push(region.id);
          containing.set(owner, list);
        }
        snippets.push({ id: region.id, file: rel, step: owner?.id, importOnly });

        // Rules 6 and 7 walk the AST inside the visible region. Hidden lines are excluded for rule 6, because they hold
        // harness configuration and not docs text.
        const visit = (node: ts.Node): void => {
          const startLine = lineOf(node.getStart(source));
          const inRegion = isInsideRegion(region, startLine);
          if (inRegion && !ERROR_HANDLING_SNIPPETS.has(region.id) && ts.isTryStatement(node)) add(startLine, `try/catch inside snippet "${region.id}" (snippets let errors throw)`);
          if (
            inRegion &&
            !ERROR_HANDLING_SNIPPETS.has(region.id) &&
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            node.expression.expression.getText(source) === 'console' &&
            node.expression.name.text === 'error'
          ) {
            add(startLine, `console.error inside snippet "${region.id}" (snippets let errors throw)`);
          }
          if (ts.isStringLiteral(node) && isVisibleLine(region, startLine)) {
            const value = node.text;
            if (PLACEHOLDER_LOOKALIKE.test(value) && !isPlaceholder(value)) {
              add(startLine, `placeholder-like literal "${value}" in "${region.id}" is not in fixtures/names.ts placeholders`);
            } else if (isResourcePosition(node) && !isRegisteredName(value) && !isPlaceholder(value)) {
              add(startLine, `resource-like literal "${value}" in "${region.id}" is not in fixtures/names.ts`);
            }
          }
          ts.forEachChild(node, visit);
        };
        visit(source);
      }

      // Rule 5.
      for (const call of calls) {
        const ids = containing.get(call) ?? [];
        if (call.kind === 'step') {
          if (ids.length === 0) add(call.startLine, `step "${call.id}" contains no snippet (use check() for harness-only steps)`);
          else {
            if (!ids.includes(call.id)) add(call.startLine, `step name "${call.id}" is not one of its snippet ids [${ids.join(', ')}]`);
            if (ids[0] !== call.id && ids.includes(call.id)) add(call.startLine, `step "${call.id}" must be the first snippet id inside (found ${ids[0]} first)`);
            const declared = call.declared ?? [call.id];
            if (declared.join('|') !== ids.join('|')) {
              add(call.startLine, `step "${call.id}" declares snippets [${declared.join(', ')}] but contains [${ids.join(', ')}]`);
            }
          }
        } else if (ids.length > 0) {
          add(call.startLine, `${call.kind}() "${call.id}" contains snippet markers [${ids.join(', ')}], use step()`);
        }
      }
    }
  }
  // Standalone sources (quickstarts/*.ts, *.tsx, *.jsx). They are the exact text of the Web, React and React Native
  // quickstart pages and of the React, browser-only and React Native samples of the API reference. This repository cannot
  // run them (no browser, no React, no React Native), so no step() callback runs them. Rules 1 and 2 apply (id shape,
  // uniqueness, no nesting, snippet.end), hidden lines are not allowed except one `@ts-expect-error` line, and the
  // step and literal rules (3 to 7) do not apply: the pages teach try/catch around publish and use their own channel
  // literals.
  const standalone = path.join(appDir, STANDALONE_DIR);
  if (fs.existsSync(standalone)) {
    for (const name of fs.readdirSync(standalone).filter((f) => /\.(tsx?|jsx)$/.test(f))) {
      files += 1;
      const rel = path.join(STANDALONE_DIR, name);
      const source = fs.readFileSync(path.join(standalone, name), 'utf8');
      const { regions, problems } = scanMarkers(source);
      problems.forEach((p) => errors.push({ file: rel, line: p.line, message: p.message }));
      for (const region of regions) {
        if (!ID.test(region.id)) errors.push({ file: rel, line: region.startLine, message: `snippet id "${region.id}" does not match ${ID}` });
        const previous = seen.get(region.id);
        if (previous) errors.push({ file: rel, line: region.startLine, message: `duplicate snippet id "${region.id}" (also in ${previous})` });
        else seen.set(region.id, `${rel}:${region.startLine}`);
        // The one exception, as in rule 3: a hidden block that is a single `@ts-expect-error` line for an SDK typing bug.
        for (const block of region.hidden) {
          const body = block.showLine === undefined ? '' : source.split('\n').slice(block.hideLine, block.showLine - 1).join('\n');
          if (isTypeSuppression(body)) suppressions.push(`${rel}:${block.hideLine} (${region.id})`);
          else errors.push({ file: rel, line: block.hideLine, message: `snippet "${region.id}" hides lines, standalone snippets must show exactly what the page shows (only a single @ts-expect-error line may be hidden)` });
        }
        snippets.push({ id: region.id, file: rel, importOnly: false });
      }
    }
  }
  return { errors, files, snippets, steps, suppressions };
}

/**
 * Removes `//` line comments and block comments, so rule 3 sees only code. The negative class before `//` keeps `https://` inside
 * a string from being cut. A heuristic, adequate for hidden blocks of at most three lines.
 */
export function stripComments(body: string): string {
  return body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

/** A hidden block that is exactly one `// @ts-expect-error` comment line. */
export function isTypeSuppression(body: string): boolean {
  const lines = body.split('\n').filter((l) => l.trim() !== '');
  return lines.length === 1 && /^\s*\/\/\s*@ts-expect-error\b/.test(lines[0]);
}

function isResourcePosition(node: ts.StringLiteral): boolean {
  const parent = node.parent;
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
    return ts.isIdentifier(parent.name) && RESOURCE_KEYS.has(parent.name.text);
  }
  if (ts.isArrayLiteralExpression(parent)) {
    const holder = parent.parent;
    return ts.isPropertyAssignment(holder) && ts.isIdentifier(holder.name) && RESOURCE_ARRAY_KEYS.has(holder.name.text);
  }
  if (ts.isCallExpression(parent) && parent.arguments[0] === node && ts.isPropertyAccessExpression(parent.expression)) {
    return RESOURCE_CALLS.has(parent.expression.name.text);
  }
  return false;
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

export function printLint(result: LintResult): void {
  const ids = result.snippets.length;
  const importOnly = result.snippets.filter((s) => s.importOnly).length;
  if (result.errors.length === 0) {
    console.log(`marker lint ok. ${result.files} files, ${result.steps} steps, ${ids} snippets (${importOnly} import-only).`);
    for (const s of result.suppressions) console.log(`  allowed hidden @ts-expect-error: ${s}`);
    return;
  }
  for (const issue of result.errors) console.error(`${issue.file}:${issue.line}  ${issue.message}`);
  console.error(`marker lint failed with ${result.errors.length} problem(s) in ${result.files} files.`);
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  const result = lintApp(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'));
  printLint(result);
  process.exit(result.errors.length === 0 ? 0 : 1);
}
