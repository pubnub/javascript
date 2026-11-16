'use strict';
/**
 * Per snippet id results for the GitHub Actions run page.
 *
 * Why: the reporter (reporter.cjs) summarises one shard by step, and each shard writes its own block. A reader who wants to
 * know "did the sample with id X pass" has to match step ids to snippet ids by hand across three blocks. This script reads the
 * reports of every shard plus coverage.json and writes one Markdown block with one row per snippet id of the manifest:
 *
 *   - live snippets: passed, failed, skipped (with the reason), or "not run" when no shard report has a step for the id
 *   - compile-only snippets: type checked in the dry job, never run
 *   - stubs: kept for the docs URLs, never run
 *
 * Usage (from the SDK repository root):
 *   node docs-snippets/harness/snippet-summary.cjs [reportDir ...]
 *
 * Each reportDir holds a run.json. The default is docs-snippets/report, the folder of a local run. CI passes the three shard
 * folders (docs-snippets/report/open, pam, datasync). The Markdown goes to $GITHUB_STEP_SUMMARY when it is set, and always to
 * stdout. Output passes through redact() like every other file the suite writes. Never fails the job, the exit code of the
 * suite decides that.
 */
const fs = require('node:fs');
const path = require('node:path');
const { redact } = require('./redact.cjs');

const ICON = {
  passed: 'passed',
  failed: 'FAILED',
  skipped: 'skipped',
  'not-run': 'NOT RUN',
  'compile-only': 'type checked only',
  stub: 'stub, not run',
};

/** First line of an error, short enough for a table cell. */
function firstLine(text) {
  return String(text || '')
    .split('\n')[0]
    .replace(/\|/g, '\\|')
    .replace(/`/g, "'")
    .slice(0, 160);
}

/** The result of one manifest entry, from the step records of all reports. Pure. */
function resultOf(id, entry, records) {
  const hit = records.filter((r) => (r.step.snippets || []).includes(id) || (entry.step && r.step.id === entry.step));
  if (hit.length === 0) {
    if (entry.mode === 'compile-only') return { status: 'compile-only', reason: entry.reason };
    if (entry.mode === 'stub') return { status: 'stub', reason: entry.reason };
    return { status: 'not-run' };
  }
  // A failure anywhere wins, then a skip, then pass.
  const failed = hit.find((r) => r.step.status === 'failed');
  const skipped = hit.find((r) => r.step.status === 'skipped');
  const chosen = failed || skipped || hit[0];
  return {
    status: chosen.step.status,
    reason: chosen.step.status === 'skipped' ? chosen.step.reason : undefined,
    error: chosen.step.status === 'failed' ? chosen.step.error : undefined,
    stepId: chosen.step.id,
    shard: chosen.shard,
    page: chosen.step.page,
    ms: hit.reduce((sum, r) => sum + (r.step.durationMs || 0), 0),
  };
}

/**
 * The Markdown block. Pure: `reports` is [{ shard, report }] (report = a parsed run.json), `manifest` is the `snippets`
 * object of coverage.json.
 */
function renderSnippetSummary(reports, manifest) {
  const records = [];
  for (const { shard, report } of reports) for (const step of report.steps || []) records.push({ shard, step });
  const rows = Object.keys(manifest)
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, entry: manifest[id], result: resultOf(id, manifest[id], records) }));

  const count = (status) => rows.filter((r) => r.result.status === status).length;
  const lines = [];
  lines.push('## Docs snippets: result per snippet id', '');
  const shards = reports.map((r) => r.shard).join(', ') || 'none';
  lines.push(`Shards with a report: ${shards}. Snippet ids in the manifest: ${rows.length}.`, '');
  lines.push('| Passed | Failed | Skipped | Not run | Type checked only | Stubs |', '| ---: | ---: | ---: | ---: | ---: | ---: |');
  lines.push(
    `| ${count('passed')} | ${count('failed')} | ${count('skipped')} | ${count('not-run')} | ${count('compile-only')} | ${count('stub')} |`,
  );

  const failed = rows.filter((r) => r.result.status === 'failed');
  if (failed.length) {
    lines.push('', `### Failed (${failed.length})`, '', '| Snippet id | Page | Shard | Error |', '| :-- | :-- | :-- | :-- |');
    for (const r of failed)
      lines.push(`| \`${r.id}\` | ${r.result.page || '-'} | ${r.result.shard} | ${firstLine(r.result.error)} |`);
  }
  const notRun = rows.filter((r) => r.result.status === 'not-run');
  if (notRun.length) {
    lines.push(
      '',
      `### Not run (${notRun.length})`,
      '',
      'Live snippets with no step in any shard report. Usually a shard that crashed or was cancelled before it got to them.',
      '',
      notRun.map((r) => `\`${r.id}\``).join(', '),
    );
  }
  const skipped = rows.filter((r) => r.result.status === 'skipped');
  if (skipped.length) {
    lines.push('', `### Skipped (${skipped.length})`, '', '| Snippet id | Reason |', '| :-- | :-- |');
    for (const r of skipped) lines.push(`| \`${r.id}\` | \`${r.result.reason || '(none)'}\` |`);
  }

  lines.push('', '### All snippet ids', '', '| Snippet id | Result | Where | Time |', '| :-- | :-- | :-- | ---: |');
  for (const r of rows) {
    const { status, reason, page, shard, ms } = r.result;
    const where = status === 'compile-only' || status === 'stub' ? r.entry.file || '-' : `${page || '-'} (${shard || '-'})`;
    const note = status === 'compile-only' || status === 'stub' ? ` (${firstLine(reason)})` : '';
    lines.push(`| \`${r.id}\` | ${ICON[status]}${note} | ${where} | ${ms === undefined ? '-' : `${(ms / 1000).toFixed(1)} s`} |`);
  }
  return `${lines.join('\n')}\n`;
}

/** Reads run.json from each directory. A missing file is skipped, so a cancelled shard still gets a summary. */
function loadReports(dirs) {
  const reports = [];
  for (const dir of dirs) {
    const file = path.join(dir, 'run.json');
    if (!fs.existsSync(file)) continue;
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    const shard = (report.selection && report.selection.shard) || path.basename(dir);
    reports.push({ shard, report });
  }
  return reports;
}

function main(argv) {
  const root = path.resolve(__dirname, '..');
  const dirs = argv.length ? argv : [path.join(root, 'report')];
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'coverage.json'), 'utf8')).snippets;
  const md = redact(renderSnippetSummary(loadReports(dirs), manifest));
  process.stdout.write(md);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { renderSnippetSummary, loadReports, resultOf };
