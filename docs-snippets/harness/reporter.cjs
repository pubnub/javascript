'use strict';
/**
 * Mocha reporter of the docs snippet suite. Extends Mocha's Spec reporter (the console output stays the familiar one) and
 * writes, when the run ends:
 *
 *   docs-snippets/report/run.json   per step: step id, snippet ids, page, role, status, skip reason, duration, assertion
 *                                   count, prerequisite flag, the error. Plus the SDK version and commit, the run id, the
 *                                   selection, per-phase durations, the skip list and any disallowed skip.
 *   $GITHUB_STEP_SUMMARY            a Markdown summary, when the variable is set (GitHub Actions).
 *
 * Everything written goes through `redact()` first. GitHub masks secrets in logs, not in uploaded artifacts, so this is the
 * only protection of report/run.json. CommonJS because Mocha loads reporters with `require`, which is also why the allowed
 * skip patterns repeat harness/skips.ts. Keep both in sync.
 */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const Mocha = require('mocha');
const { redact } = require('./redact.cjs');

const { Spec } = Mocha.reporters;
const ALLOWED = /^(browser-only|react-native|needs-real-device|needs-feature:[a-z0-9-]+)$/;
const RUNNER = /^(blocked-by:.+|missing-env:(open|pam|datasync))$/;
const ANSI = /\u001b\[[0-9;]*m/g;
const PHASES = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];

/** SDK version and commit of the checkout under test. The suite lives in the SDK repository, two levels above harness/. */
function sdkInfo() {
  const root = path.resolve(__dirname, '..', '..');
  let version = null;
  let commit = null;
  try {
    version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  } catch (e) {
    version = null;
  }
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (e) {
    commit = process.env.GITHUB_SHA || 'unknown';
  }
  return { version, commit };
}

function message(error) {
  return String((error && error.message) || error)
    .replace(ANSI, '')
    .split('\n')
    .slice(0, 25)
    .join('\n');
}

/** One step record from a Mocha test. `pnMeta`, `pnReason` and `pnNote` are tags that mocha-entry.ts put on the test. */
function entry(test, status, error) {
  const meta = test.pnMeta || {};
  const assertions = test.pnAssertions || [];
  const count = assertions.reduce((sum, a) => sum + (a.count || 1), 0) + (test.pnDropped || 0);
  const bad = assertions.find((a) => !a.ok);
  const record = {
    id: meta.id || test.title,
    snippets: meta.snippets || [],
    page: meta.page || null,
    phase: meta.phase || null,
    kind: meta.kind || null,
    role: meta.keyset || null,
    prerequisite: Boolean(meta.prerequisite),
    status,
    reason: test.pnReason || meta.skipIf || undefined,
    note: test.pnNote || undefined,
    durationMs: typeof test.duration === 'number' ? test.duration : 0,
    assertions: count,
    proves: meta.proves || undefined,
  };
  if (error) {
    record.error = message(error);
    if (bad)
      record.failedAssertion = { label: bad.label, expected: bad.expected, actual: bad.actual, frame: bad.frame };
    if (test.pnOutput && test.pnOutput.length) record.output = test.pnOutput.slice(-30);
  }
  return record;
}

/** Builds the report object. Pure, the dry run self-test calls it with simulated steps. */
function buildReport(steps, context) {
  const plan = context.plan || [];
  const counted = steps.filter((s) => !s.prerequisite);
  const summary = {
    passed: counted.filter((s) => s.status === 'passed').length,
    failed: counted.filter((s) => s.status === 'failed').length,
    skipped: counted.filter((s) => s.status === 'skipped').length,
    prerequisites: steps.filter((s) => s.prerequisite).length,
    notSelected: plan.filter((p) => !p.selected && !p.prerequisite).length,
  };
  const skips = steps
    .filter((s) => s.status === 'skipped')
    .map((s) => ({
      id: s.id,
      reason: s.reason || '(none)',
      note: s.note,
      allowed: ALLOWED.test(s.reason || '') || RUNNER.test(s.reason || ''),
    }));
  const problems = skips
    .filter((s) => !s.allowed)
    .map((s) => `step ${s.id} skipped with a reason outside the allowed list: ${s.reason}`);
  const phases = {};
  for (const phase of PHASES) {
    const inPhase = steps.filter((s) => s.phase === phase);
    if (inPhase.length)
      phases[phase] = { steps: inPhase.length, ms: inPhase.reduce((sum, s) => sum + s.durationMs, 0) };
  }
  const zero = steps.filter((s) => s.status === 'passed' && s.kind === 'step' && s.assertions === 0).map((s) => s.id);
  return {
    schema: 1,
    status: summary.failed > 0 || problems.length > 0 ? 'failed' : 'passed',
    runId: context.runId || null,
    startedAt: context.startedAt,
    finishedAt: context.finishedAt,
    durationMs: context.durationMs,
    sdk: context.sdk,
    selection: context.selection || null,
    summary,
    phases,
    skips,
    problems,
    zeroAssertionSteps: zero,
    notSelected: plan.filter((p) => !p.selected && !p.prerequisite).map((p) => p.id),
    steps,
  };
}

function seconds(ms) {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** The Markdown summary for GitHub Actions. Pure. */
function renderMarkdown(report) {
  const lines = [];
  const shard = report.selection && report.selection.shard ? ` (shard ${report.selection.shard})` : '';
  lines.push(`## Docs snippets live run${shard}: ${report.status}`);
  lines.push('');
  lines.push(
    `Run \`${report.runId}\`, SDK ${report.sdk.version} at \`${String(report.sdk.commit || '').slice(0, 12)}\`, ${seconds(report.durationMs || 0)}.`,
  );
  lines.push('');
  lines.push('| Passed | Failed | Skipped | Prerequisites | Not selected |');
  lines.push('| ---: | ---: | ---: | ---: | ---: |');
  const s = report.summary;
  lines.push(`| ${s.passed} | ${s.failed} | ${s.skipped} | ${s.prerequisites} | ${s.notSelected} |`);
  const failed = report.steps.filter((x) => x.status === 'failed');
  if (failed.length) {
    lines.push('', `### Failures (${failed.length})`, '');
    for (const f of failed)
      lines.push(`- \`${f.id}\` (${f.page}, role ${f.role}): ${String(f.error || '').split('\n')[0]}`);
  }
  if (report.skips.length) {
    lines.push('', `### Skips (${report.skips.length})`, '');
    const byReason = new Map();
    for (const k of report.skips) byReason.set(k.reason, [...(byReason.get(k.reason) || []), k.id]);
    for (const [reason, ids] of byReason) lines.push(`- \`${reason}\`: ${ids.map((id) => `\`${id}\``).join(', ')}`);
  }
  if (report.problems.length) {
    lines.push('', '### Problems', '');
    for (const p of report.problems) lines.push(`- ${p}`);
  }
  lines.push('', '### Time per phase', '', '| Phase | Steps | Time |', '| :-- | ---: | ---: |');
  for (const [phase, v] of Object.entries(report.phases)) lines.push(`| ${phase} | ${v.steps} | ${seconds(v.ms)} |`);
  const slow = [...report.steps].sort((a, b) => b.durationMs - a.durationMs).slice(0, 10);
  lines.push('', '### Slowest steps', '', '| Step | Time |', '| :-- | ---: |');
  for (const x of slow) lines.push(`| \`${x.id}\` | ${seconds(x.durationMs)} |`);
  return `${lines.join('\n')}\n`;
}

/** Writes run.json and the step summary, all redacted. Returns the paths written. */
function writeReport(report, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const json = redact(JSON.stringify(report, null, 2));
  const file = path.join(dir, 'run.json');
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, file);
  const written = [file];
  const md = redact(renderMarkdown(report));
  fs.writeFileSync(path.join(dir, 'summary.md'), md);
  written.push(path.join(dir, 'summary.md'));
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
    written.push(process.env.GITHUB_STEP_SUMMARY);
  }
  return written;
}

class DocsSnippetsReporter extends Spec {
  constructor(runner, options) {
    super(runner, options);
    const startedAt = new Date();
    const steps = [];
    runner.on('pass', (test) => steps.push(entry(test, 'passed')));
    runner.on('fail', (test, error) => {
      // Hook failures are reported too, under the hook title, so a broken root hook is never silent.
      steps.push(entry(test, 'failed', error));
    });
    runner.on('pending', (test) => steps.push(entry(test, 'skipped')));
    runner.once('end', () => {
      const finishedAt = new Date();
      const report = buildReport(steps, {
        plan: globalThis.__pnDocsPlan,
        selection: globalThis.__pnDocsSelection,
        runId: process.env.DOCS_SNIPPETS_RUN_ID,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        sdk: sdkInfo(),
      });
      const dir = process.env.DOCS_SNIPPETS_REPORT_DIR || path.resolve(__dirname, '..', 'report');
      try {
        const written = writeReport(report, dir);
        process.stdout.write(`report: ${written.join(', ')}\n`);
      } catch (error) {
        process.stderr.write(`report: could not write ${dir}: ${error && error.message}\n`);
      }
    });
  }
}

module.exports = DocsSnippetsReporter;
module.exports.buildReport = buildReport;
module.exports.renderMarkdown = renderMarkdown;
module.exports.writeReport = writeReport;
