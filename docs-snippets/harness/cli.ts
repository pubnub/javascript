import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import Mocha from 'mocha';
import { addSecrets, installRedaction, knownSecrets, redact } from './redact.cjs';
import {
  ciRunId,
  describeRoles,
  ENV_VARS,
  loadEnv,
  randomRunId,
  ROLES,
  runIdAgeMs,
  type Env,
  type Role,
} from './env.js';
import { lintApp, printLint } from './lint-markers.js';
import { stage } from './stage.js';
import { runJanitor } from './janitor.js';
import { featureSkips, launchProblems, outcomeProblems } from './policy.js';
import { classifyPreflightError, preflightMessage } from './preflight-errors.js';
import { buildManifest, docsIds, serialize } from './manifest.js';
import { provisionDataSync } from '../provision/provision-datasync.js';
import type { Registry, Selection } from './registry.js';

/**
 * Commands (root package.json scripts):
 *   live       npm run test:docs-snippets [-- --grep <re>] [-- --shard <role>]
 *   dry        npm run test:docs-snippets:dry           no network
 *   janitor    npm run test:docs-snippets:janitor       leftovers older than six hours, and the application-level grants
 *   manifest   npm run docs-snippets:manifest [-- --check]
 *   stage      only build docs-snippets/.run/<runId>/
 *   lint       marker lint only
 *
 * Run flow of `live`:
 *   1. install output redaction, load env (prints "set" or "missing" per role, never a value), pick the run id
 *   2. launch policy (CI refuses subset runs and debug logging), marker lint, stage into `.run/<runId>/`
 *   3. compute the selection from the staged plan. When it includes the datasync role, set up the DataSync classes first
 *      (provision/provision-datasync.ts), before preflight and before any step
 *   4. run Mocha programmatically on `.run/<runId>/harness/mocha-entry.ts`. Its root hooks prove Access Manager enforcement
 *      before and after, and run the janitor after. The reporter writes report/run.json
 *   5. read that report back and apply the outcome policy (skip budget, required features, strict, residue)
 *   6. wait for the event loop to drain. If it is still busy 10 s later, print the open handles and exit 1
 *
 * Mocha is driven from here and not through a config file alone because the file to run only exists after staging.
 * `docs-snippets/.mocharc.cjs` holds the shared Mocha options (reporter, retries, timeout) and this file reads it.
 */

const SUITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The default local env file, passed on through the environment so the staged copy under .run/<runId>/ reads it too.
if (!process.env.DOCS_SNIPPETS_ENV_FILE && fs.existsSync(path.join(SUITE_DIR, '.env.local'))) {
  process.env.DOCS_SNIPPETS_ENV_FILE = path.join(SUITE_DIR, '.env.local');
}
const REPORT_DIR = path.join(SUITE_DIR, 'report');
const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith('-') ? args[0] : 'live';
const rest = command === args[0] ? args.slice(1) : args;

/** `--name value` or `--name=value`. */
function option(name: string): string | undefined {
  for (let i = 0; i < rest.length; i += 1) {
    if (rest[i] === name) return rest[i + 1];
    if (rest[i].startsWith(`${name}=`)) return rest[i].slice(name.length + 1);
  }
  return undefined;
}
const flags = new Set(rest.filter((a) => a.startsWith('--')));

async function mochaOptions(): Promise<Mocha.MochaOptions> {
  const config = (await import(pathToFileURL(path.join(SUITE_DIR, '.mocharc.cjs')).href)) as {
    default: Mocha.MochaOptions;
  };
  return { ...config.default, reporter: path.join(SUITE_DIR, 'harness', 'reporter.cjs') };
}

/** Imports the staged plan and registers it, without a network. Returns the staged registry. */
async function stagedPlan(
  runDir: string,
  env: Env,
  runId: string,
): Promise<{
  registry: Registry;
  selection: (f: { shard?: Role; grep?: string; only?: string[] }) => Selection;
  roles: (s: Selection) => Set<Role>;
}> {
  const run = (await import(pathToFileURL(path.join(runDir, 'run.ts')).href)) as typeof import('../run.js');
  const worldModule = (await import(
    pathToFileURL(path.join(runDir, 'harness', 'world.ts')).href
  )) as typeof import('./world.js');
  const reg = (await import(
    pathToFileURL(path.join(runDir, 'harness', 'registry.ts')).href
  )) as typeof import('./registry.js');
  const world = new worldModule.World(env, runId);
  run.registry.reset();
  run.registry.availability = { open: true, pam: true, datasync: true };
  run.registerAll(world);
  return {
    registry: run.registry,
    selection: (f) => reg.selectSteps(run.registry, f),
    roles: (s) => reg.rolesOf(run.registry, s),
  };
}

/** Exits with `code` once the event loop is empty. If it is still busy after 10 s, prints the open handles and exits 1. */
function exitWhenIdle(code: number): void {
  const timer = setTimeout(() => {
    console.error(`the event loop is still busy 10 s after the run finished (run exit code ${code}). Open handles:`);
    console.error(`  ${describeHandles().join('\n  ') || 'none reported'}`);
    process.exit(1);
  }, 10_000);
  timer.unref();
  process.once('beforeExit', () => {
    clearTimeout(timer);
    process.exit(code);
  });
}

/**
 * What keeps the event loop alive, one line per handle. Node's own lists, so nothing has to be loaded before the handles were
 * created (why-is-node-running only sees handles created after it loads). Sockets show the remote host and port, timers
 * their delay, child processes their pid. No key appears here, and stderr is redacted anyway.
 */
function describeHandles(): string[] {
  const lines: string[] = [];
  const handles = (process as unknown as { _getActiveHandles?: () => unknown[] })._getActiveHandles?.() ?? [];
  for (const handle of handles) {
    if (handle === process.stdout || handle === process.stderr || handle === process.stdin) continue;
    const h = handle as {
      constructor?: { name?: string };
      remoteAddress?: string;
      remotePort?: number;
      _host?: string;
      servername?: string;
      pid?: number;
      spawnfile?: string;
      _idleTimeout?: number;
      address?: () => unknown;
      hasRef?: () => boolean;
    };
    const name = h.constructor?.name ?? typeof handle;
    const detail: string[] = [];
    if (h.servername || h._host) detail.push(`host ${h.servername ?? h._host}`);
    if (h.remoteAddress) detail.push(`remote ${h.remoteAddress}:${h.remotePort ?? ''}`);
    if (h.pid) detail.push(`pid ${h.pid}${h.spawnfile ? ` ${h.spawnfile}` : ''}`);
    if (typeof h._idleTimeout === 'number' && h._idleTimeout > 0) detail.push(`timeout ${h._idleTimeout} ms`);
    if (name === 'Server' && typeof h.address === 'function') detail.push(`listening ${JSON.stringify(h.address())}`);
    if (typeof h.hasRef === 'function' && !h.hasRef()) detail.push('unref');
    lines.push(`${name}${detail.length ? ` (${detail.join(', ')})` : ''}`);
  }
  const resources = process.getActiveResourcesInfo().filter((r) => r !== 'TTYWrap');
  lines.push(`resource types: ${resources.join(', ') || 'none'}`);
  return lines;
}

async function live(): Promise<number> {
  installRedaction();
  const shardArg = option('--shard');
  if (shardArg) process.env[ENV_VARS.shard] = shardArg;
  const env = loadEnv();
  console.log(describeRoles(env));
  const grep = option('--grep');
  if (!env.open && !env.pam && !env.datasync) {
    console.log(
      `skipped: no keyset is configured. Set the env names in docs-snippets/README.md or ${ENV_VARS.envFile}.`,
    );
    return env.ci || flags.has('--require-env') ? 1 : 0;
  }
  const launch = launchProblems(env, process.env, { grep });
  if (launch.length > 0) {
    launch.forEach((p) => console.error(p));
    return 1;
  }
  const runId = env.runId ?? (env.ci ? ciRunId(process.env, env.shard) : randomRunId());
  process.env[ENV_VARS.runId] = runId;
  process.env.DOCS_SNIPPETS_REPORT_DIR = REPORT_DIR;
  if (grep) process.env.DOCS_SNIPPETS_GREP = grep;
  else delete process.env.DOCS_SNIPPETS_GREP;
  console.log(`run id ${runId}${env.shard ? `, shard ${env.shard}` : ''} (staging in docs-snippets/.run/${runId}/)`);

  const phase = timer();
  const lint = lintApp(SUITE_DIR);
  printLint(lint);
  if (lint.errors.length > 0) return 1;
  const staged = stage(SUITE_DIR, runId, { mutate: process.env.DOCS_SNIPPETS_MUTATE || undefined });
  console.log(
    `staged ${staged.filesCopied} files, ${staged.rewrites.length} literal rewrites, ${staged.ranMarkers} snippet.end markers instrumented${staged.ranFallbacks.length ? ` (AST fallback: ${staged.ranFallbacks.map((f) => f.id).join(', ')})` : ''}${staged.mutated ? `, mutated ${staged.mutated}` : ''}`,
  );
  if (staged.problems.length > 0) {
    staged.problems.forEach((p) => console.error(p));
    return 1;
  }
  console.log(`phase stage: ${phase()}`);

  const only = process.env.DOCS_SNIPPETS_ONLY?.split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  const plan = await stagedPlan(staged.runDir, env, runId);
  const selection = plan.selection({ shard: env.shard, grep, only });
  const roles = plan.roles(selection);
  console.log(
    `selected ${selection.run.size - selection.prerequisites.size} step(s), ${selection.prerequisites.size} prerequisite(s), roles ${[...roles].join(', ')}`,
  );
  if (selection.run.size === 0) {
    console.error('no step matches the selection');
    return 1;
  }

  if (roles.has('datasync')) {
    const setup = timer();
    console.log('DataSync class setup (before preflight and before any step):');
    const result = await provisionDataSync(env, { check: false });
    result.log.forEach((line) => console.log(`  ${line}`));
    if (!result.ok) {
      result.problems.forEach((p) => console.error(`DataSync class setup failed: ${p}`));
      return 1;
    }
    console.log(`phase datasync setup: ${setup()}`);
  }

  const mocha = new Mocha(await mochaOptions());
  mocha.addFile(path.join(staged.runDir, 'harness', 'mocha-entry.ts'));
  await mocha.loadFilesAsync();
  const steps = timer();
  const failures = await new Promise<number>((resolve) => {
    mocha.run((count) => resolve(count));
  });
  console.log(`phase steps: ${steps()}`);

  const reportPath = path.join(REPORT_DIR, 'run.json');
  let problems: string[] = [];
  let skips: Array<{ id: string; reason: string; note?: string }> = [];
  if (fs.existsSync(reportPath)) {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      runId: string;
      problems: string[];
      skips: Array<{ id: string; reason: string; note?: string }>;
    };
    if (report.runId !== runId) problems.push(`report/run.json belongs to run ${report.runId}, not ${runId}`);
    problems = [...problems, ...report.problems];
    skips = report.skips;
  } else {
    problems.push('no report was written to docs-snippets/report/run.json');
  }
  problems.push(...outcomeProblems(env, { skips }));
  for (const skip of skips) console.log(`skip: ${skip.id} (${skip.reason})${skip.note ? ` ${skip.note}` : ''}`);
  for (const skip of featureSkips({ skips })) console.log(`feature skip: ${skip.id} (${skip.reason})`);
  problems.forEach((p) => console.error(p));
  return failures > 0 || problems.length > 0 ? 1 : 0;
}

function timer(): () => string {
  const started = Date.now();
  return () => `${((Date.now() - started) / 1000).toFixed(1)} s`;
}

/** No network: everything that can be proven without keys. */
async function dryRun(): Promise<number> {
  let failed = false;
  const fail = (message: string): void => {
    failed = true;
    console.error(`FAIL ${message}`);
  };
  const heading = (title: string): void => console.log(`\n== ${title}`);

  heading('1. Environment gate (no keys needed)');
  const emptyEnv = loadEnv({});
  console.log(`  with no env names set: ${describeRoles(emptyEnv)}`);
  if (emptyEnv.open || emptyEnv.pam || emptyEnv.datasync) fail('empty environment produced a keyset');
  {
    // An env file with the older PN_DOCS_* names maps onto the suite's names, and real variables win.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-snippets-env-'));
    const file = path.join(dir, '.env.local');
    // The older names come from the mapping table itself, so this file holds no copy of them.
    const { envSource, FILE_ALIASES } = await import('./env.js');
    const alias = (name: string): string => FILE_ALIASES[name][0];
    fs.writeFileSync(
      file,
      [
        `${alias('PUBLISH_KEY')}=pub-file`,
        `${alias('SUBSCRIBE_KEY')}=sub-file`,
        `${alias('PAM_PUBLISH_KEY')}=pub-sec`,
        `${alias('PAM_SUBSCRIBE_KEY')}=sub-sec`,
        `${alias('PAM_SECRET_KEY')}=sec-sec`,
      ].join('\n'),
    );
    const mapped = loadEnv(envSource({ [ENV_VARS.envFile]: file, PUBLISH_KEY: 'pub-real' }));
    if (mapped.open?.publishKey !== 'pub-real' || mapped.open?.subscribeKey !== 'sub-file')
      fail('env file: real variables must win over the file');
    if (mapped.pam?.secretKey !== 'sec-sec' || mapped.datasync?.secretKey !== 'sec-sec' || !mapped.sharedSecured)
      fail('env file: the secured keyset must fill pam and datasync');
    const line = describeRoles(mapped);
    if (/pub-file|sub-file|pub-sec|sub-sec|sec-sec|pub-real/.test(line)) fail('the loader output contains a key value');
    console.log(`  env file mapping: ${line.replace(dir, '<tmp>')}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  heading('2. Marker lint');
  const lint = lintApp(SUITE_DIR);
  printLint(lint);
  if (lint.errors.length > 0) failed = true;

  heading('3. Staging rewrite and honesty instrumentation');
  const runId = randomRunId();
  const staged = stage(SUITE_DIR, runId);
  console.log(`  copied ${staged.filesCopied} files, ${staged.rewrites.length} literal rewrites with run id ${runId}`);
  for (const from of [
    'my_channel',
    'chats.room1',
    'uuid',
    'replace_with_message_timetoken',
    'replace-with-end-timetoken',
  ]) {
    const hit = staged.rewrites.find((r) => r.from === from);
    if (hit) console.log(`  sample ${hit.file}:${hit.line}  '${hit.from}' -> ${hit.to}`);
    else fail(`no rewrite found for sample literal '${from}'`);
  }
  staged.problems.forEach((p) => fail(p));
  const leaked = staged.rewrites.filter(
    (r) => r.kind === 'name' && fs.readFileSync(path.join(SUITE_DIR, r.file), 'utf8').includes(r.to),
  );
  if (leaked.length > 0) fail(`source files contain rewritten names, e.g. ${leaked[0].file}: ${leaked[0].to}`);
  const stepIds = lint.snippets.filter((s) => s.step).length;
  console.log(
    `  __snippetRan on ${staged.ranMarkers} of ${stepIds} snippet.end lines inside step bodies, AST fallback for: ${staged.ranFallbacks.map((f) => `${f.id} (${f.file}:${f.line})`).join(', ') || 'none'}`,
  );
  if (staged.ranMarkers !== stepIds)
    fail(`expected ${stepIds} instrumented snippet.end lines, got ${staged.ranMarkers}`);
  if (!fs.realpathSync(path.join(staged.runDir, 'node_modules', 'pubnub')).startsWith(path.resolve(SUITE_DIR, '..')))
    fail('the staged node_modules/pubnub link does not point at this repository');
  {
    let other = randomRunId();
    while (other === runId) other = randomRunId();
    const mutated = stage(SUITE_DIR, other, { mutate: 'publishBasicUsage' });
    const text = fs.readFileSync(path.join(mutated.runDir, 'api-reference', 'publish.ts'), 'utf8');
    if (
      mutated.mutated !== 'publishBasicUsage' ||
      !/throw new Error\('DOCS_SNIPPETS_MUTATE publishBasicUsage'\); __snippetStart\('publishBasicUsage'\); \/\/ snippet\.publishBasicUsage/.test(
        text,
      )
    )
      fail('DOCS_SNIPPETS_MUTATE did not insert the throw at the start marker');
    else
      console.log(
        '  DOCS_SNIPPETS_MUTATE=publishBasicUsage inserts the throw at the start marker of the staged copy only',
      );
    if (!fs.existsSync(staged.runDir)) fail('a second stage removed the first one');
    fs.rmSync(mutated.runDir, { recursive: true, force: true });
  }

  heading('4. Step plan from the staged copy');
  const plan = await stagedPlan(staged.runDir, emptyEnv, runId);
  const registry = plan.registry;
  const wiring = registry.validate();
  wiring.forEach((p) => fail(p));
  const ordered = registry.ordered();
  const byRole = Object.fromEntries(ROLES.map((r) => [r, ordered.filter((s) => s.keyset === r).length]));
  console.log(
    `  ${ordered.length} steps registered (${ROLES.map((r) => `${r} ${byRole[r]}`).join(', ')}), ${wiring.length} wiring problems`,
  );
  const cross = registry.crossRoleNeeds();
  console.log(`  cross-role needs edges (${cross.length}):`);
  for (const e of cross) console.log(`    ${e.step} (${e.role}) needs ${e.needs} (${e.needsRole})`);

  heading('5. Static mapping: lint, registry and manifest agree');
  const lintIds = new Map(
    lint.snippets.filter((s) => !s.importOnly && !s.file.startsWith('quickstarts')).map((s) => [s.id, s.step]),
  );
  for (const s of ordered.filter((x) => x.kind === 'step')) {
    for (const id of s.snippets)
      if (lintIds.get(id) !== s.id)
        fail(`snippet "${id}" is declared by step "${s.id}" but lint found it in step "${lintIds.get(id)}"`);
  }
  const claimed = new Set(ordered.flatMap((s) => s.snippets));
  for (const [id] of lintIds) if (!claimed.has(id)) fail(`snippet "${id}" is not run by any registered step`);
  const built = buildManifest(lint, registry);
  built.problems.forEach((p) => fail(`manifest: ${p}`));
  const manifestFile = path.join(SUITE_DIR, 'coverage.json');
  if (!fs.existsSync(manifestFile) || fs.readFileSync(manifestFile, 'utf8') !== serialize(built.manifest))
    fail('coverage.json is stale, run npm run docs-snippets:manifest');
  else console.log(`  coverage.json is current: ${Object.keys(built.manifest.snippets).length} entries`);
  console.log(
    `  ${claimed.size} snippet ids run by steps, ${lint.snippets.filter((s) => s.importOnly).length} import-only snippets type checked only`,
  );

  heading('6. Selection and skip propagation (simulated, no network)');
  {
    const one = plan.selection({ grep: 'publishBasicUsage' });
    const chosen = [...one.run].filter((id) => !one.prerequisites.has(id));
    console.log(
      `  --grep publishBasicUsage selects ${chosen.join(', ')} and runs prerequisites ${[...one.prerequisites].join(', ') || 'none'}`,
    );
    if (!chosen.includes('publishBasicUsage')) fail('--grep publishBasicUsage did not select the step');
    for (const need of registry.get('publishBasicUsage')?.needs ?? [])
      if (!one.run.has(need)) fail(`prerequisite ${need} of publishBasicUsage would not run`);
    for (const role of ROLES) {
      const shard = plan.selection({ shard: role });
      const foreign = [...shard.prerequisites].filter((id) => registry.get(id)?.keyset !== role);
      console.log(
        `  shard ${role}: ${shard.run.size - shard.prerequisites.size} steps, ${foreign.length} prerequisite(s) of other roles`,
      );
    }
    const withDependents = ordered.find((s) => ordered.some((o) => o.needs.includes(s.id)));
    if (!withDependents) fail('no step has dependents, nothing to simulate');
    else {
      const result = registry.simulate([withDependents.id]);
      const blocked = result.filter((r) => r.reason === `blocked-by:${withDependents.id}`);
      console.log(`  failing "${withDependents.id}" blocks ${blocked.length} step(s)`);
      if (blocked.length === 0) fail(`failing "${withDependents.id}" blocked nothing`);
      registry.availability = { open: true, pam: false, datasync: true };
      const noPam = registry.simulate([]).filter((r) => r.reason === 'missing-env:pam').length;
      console.log(`  without the pam keyset ${noPam} step(s) skip as missing-env:pam`);
      registry.availability = { open: true, pam: true, datasync: true };
    }
  }

  heading('7. Mocha binding and reporter (step bodies replaced by no-ops, no network)');
  {
    const failId = ordered.find((s) => ordered.some((o) => o.needs.includes(s.id)))?.id;
    const reportDir = path.join(staged.runDir, 'dry-report');
    process.env.DOCS_SNIPPETS_RUN_ID = runId;
    process.env.DOCS_SNIPPETS_DRY = '1';
    if (failId) process.env.DOCS_SNIPPETS_DRY_FAIL = failId;
    process.env.DOCS_SNIPPETS_REPORT_DIR = reportDir;
    const savedSummary = process.env.GITHUB_STEP_SUMMARY;
    delete process.env.GITHUB_STEP_SUMMARY;
    const mocha = new Mocha({ ...(await mochaOptions()), timeout: 10_000 });
    mocha.addFile(path.join(staged.runDir, 'harness', 'mocha-entry.ts'));
    await mocha.loadFilesAsync();
    const failures = await new Promise<number>((resolve) => mocha.run((count) => resolve(count)));
    for (const name of [
      'DOCS_SNIPPETS_DRY',
      'DOCS_SNIPPETS_DRY_FAIL',
      'DOCS_SNIPPETS_RUN_ID',
      'DOCS_SNIPPETS_REPORT_DIR',
    ])
      delete process.env[name];
    if (savedSummary) process.env.GITHUB_STEP_SUMMARY = savedSummary;
    const report = JSON.parse(fs.readFileSync(path.join(reportDir, 'run.json'), 'utf8')) as {
      runId: string;
      summary: { passed: number; failed: number; skipped: number };
      steps: Array<{
        id: string;
        status: string;
        reason?: string;
        snippets: string[];
        role: string;
        assertions: number;
      }>;
      sdk: { version: string; commit: string };
    };
    console.log(`  mocha reported ${failures} failure(s), run.json summary ${JSON.stringify(report.summary)}`);
    if (failures !== 1) fail(`expected the one simulated failure, mocha reported ${failures}`);
    if (!report.steps.some((s) => s.reason === `blocked-by:${failId}`))
      fail('run.json shows no step blocked by the simulated failure');
    if (report.runId !== runId) fail(`run.json carries run id ${report.runId}, expected ${runId}`);
    // The commit is `unknown` in a copy without git history (a source download), the version always exists.
    if (!report.sdk.version || !report.sdk.commit) fail('run.json lacks the SDK version or commit');
    const sample = report.steps.find((s) => s.status === 'passed' && s.snippets.length > 0);
    if (!sample || !sample.role || !sample.snippets.includes(sample.id) || sample.assertions < 1)
      fail('run.json step records lack role, snippet ids or assertion counts');
    const skippedBlocked = report.steps.filter((s) => s.reason?.startsWith('blocked-by:')).length;
    console.log(`  ${skippedBlocked} step(s) skipped as blocked-by the simulated failure of ${failId}, transitively`);
    if (/0123abcd|AAAAAAAAAA/.test(fs.readFileSync(path.join(reportDir, 'run.json'), 'utf8')))
      fail('run.json leaks a key-shaped value');
    else console.log('  run.json has role, snippet ids, assertion counts, SDK version and commit, and is redacted');
  }

  heading('8. Run policy, preflight messages, redaction, run ids');
  {
    const keys = { PUBLISH_KEY: 'pub-c-x', SUBSCRIBE_KEY: 'sub-c-x' };
    const base = loadEnv(keys);
    const ci = loadEnv({ ...keys, CI: 'true' });
    const blocked = {
      skips: [
        { id: 'a', reason: 'blocked-by:preflightPresence' },
        { id: 'b', reason: 'needs-feature:push-notifications' },
      ],
    };
    if (outcomeProblems(base, blocked).length !== 0) fail('policy: blocked-by skips fail a local run by default');
    if (outcomeProblems(ci, blocked).length !== 1)
      fail('policy: CI must fail on a blocked-by skip with the default budget');
    if (outcomeProblems(loadEnv({ ...keys, CI: 'true', DOCS_SNIPPETS_SKIP_BUDGET: '1' }), blocked).length !== 0)
      fail('policy: DOCS_SNIPPETS_SKIP_BUDGET=1 should allow one blocked-by skip');
    if (launchProblems(ci, {}, { grep: 'x' }).length !== 1) fail('policy: --grep must fail in CI');
    for (const name of ['DOCS_SNIPPETS_ONLY', 'DOCS_SNIPPETS_MUTATE', 'DOCS_SNIPPETS_INJECT_FAILURE']) {
      if (launchProblems(ci, { [name]: 'x' }).length !== 1) fail(`policy: ${name} must fail in CI`);
      if (launchProblems(base, { [name]: 'x' }).length !== 0) fail(`policy: ${name} is fine locally`);
    }
    if (launchProblems(loadEnv({ CI: 'true', DOCS_SNIPPETS_LOG_LEVEL: 'debug' }), {}).length !== 1)
      fail('policy: debug log level must be refused in CI');
    const featureOnly = { skips: [{ id: 'e', reason: 'needs-feature:datasync-events' }] };
    if (outcomeProblems(ci, featureOnly).length !== 0)
      fail('policy: a needs-feature skip must not count against the CI skip budget');
    if (
      outcomeProblems(loadEnv({ ...keys, CI: 'true', DOCS_SNIPPETS_REQUIRE_FEATURES: 'datasync-events' }), featureOnly)
        .length !== 1
    )
      fail('policy: DOCS_SNIPPETS_REQUIRE_FEATURES must fail the named feature skip');
    if (outcomeProblems(loadEnv({ ...keys, DOCS_SNIPPETS_STRICT: '1' }), featureOnly).length !== 1)
      fail('policy: DOCS_SNIPPETS_STRICT=1 must make every skip fatal');
    if (outcomeProblems(ci, { skips: [{ id: 'm', reason: 'missing-env:pam' }] }).length !== 1)
      fail('policy: missing-env must fail in CI');
    console.log(
      '  run policy: skip budget, feature skips, strict, subset options and debug logging behave as documented',
    );

    const cases: Array<[string, unknown, string]> = [
      [
        'network',
        { status: { category: 'PNNetworkIssuesCategory' }, message: 'REST API request processing error' },
        'Network problem',
      ],
      [
        'bad key',
        { status: { statusCode: 400, errorData: { message: 'Invalid Subscribe Key' } } },
        'keys were rejected',
      ],
      ['feature off', { status: { statusCode: 403, errorData: { message: 'Forbidden' } } }, 'does not have Presence'],
      [
        'bad request',
        { status: { statusCode: 400, errorData: { message: 'Invalid arguments' } } },
        'not a missing feature',
      ],
    ];
    for (const [label, error, expect] of cases) {
      const message = preflightMessage(error, 'open', 'Presence', 'Presence');
      if (!message.includes(expect)) fail(`preflight message for ${label} should contain "${expect}", got: ${message}`);
    }
    if (classifyPreflightError({ code: 'ENOTFOUND' }).cause !== 'network')
      fail('preflight: ENOTFOUND is a network problem');
    console.log('  preflight errors: network, bad key, feature off and bad request read differently');

    const fake = 'pub-c-0123abcd-0123-4abc-8def-0123456789ab';
    const masked = redact(
      `config { publishKey: '${fake}', secretKey: 'sec-c-QWERTYUIOPASDFGHJKL1234', token: 'p0F2AkF0Gl${'A'.repeat(30)}' }`,
      {},
    );
    if (masked.includes('0123abcd') || masked.includes('QWERTYUIOP') || masked.includes('AAAAAAAAAA'))
      fail('redaction left a secret');
    else console.log('  redaction masks keys and tokens');

    const id = randomRunId();
    if ((runIdAgeMs(id) ?? Infinity) > 10_000) fail(`a fresh run id (${id}) should decode to a moment just now`);
    const shardIds = new Set(ROLES.map((r) => ciRunId({ GITHUB_RUN_ID: '123456', GITHUB_RUN_ATTEMPT: '1' }, r)));
    const rerunIds = new Set(ROLES.map((r) => ciRunId({ GITHUB_RUN_ID: '123456', GITHUB_RUN_ATTEMPT: '2' }, r)));
    if (shardIds.size !== 3) fail('CI run ids of the three shards of one attempt must differ');
    if ([...shardIds].some((x) => !/^[0-9a-z]{6}$/.test(x))) fail('CI run ids must be six base36 characters');
    console.log(
      `  run ids carry their start time, CI shards get distinct ids (${[...shardIds].join(', ')}; attempt 2: ${[...rerunIds].join(', ')})`,
    );
  }

  heading('9. Reporter self-test (no key value in any written file)');
  {
    // Loaded key values (if a local env file or real variables are set) plus fake ones, put into every free text field.
    const env = loadEnv();
    addSecrets(['fake-secret-value-0001', 'sub-c-ffffffff-ffff-4fff-8fff-ffffffffffff']);
    const secrets = knownSecrets();
    const { buildReport, writeReport } = (await import(
      pathToFileURL(path.join(SUITE_DIR, 'harness', 'reporter.cjs')).href
    )) as { buildReport: (s: unknown[], c: unknown) => unknown; writeReport: (r: unknown, dir: string) => string[] };
    const text = `config ${secrets.join(' ')} pub-c-0123abcd-0123-4abc-8def-0123456789ab`;
    const steps = [
      {
        id: 'leaky',
        snippets: ['leaky'],
        page: 'x',
        phase: 'P4',
        kind: 'step',
        role: 'open',
        prerequisite: false,
        status: 'failed',
        error: text,
        note: text,
        durationMs: 1,
        assertions: 1,
        output: [text],
        failedAssertion: { label: text, expected: text, actual: text },
      },
      {
        id: 'skipped',
        snippets: [],
        page: 'x',
        phase: 'P4',
        kind: 'check',
        role: 'pam',
        prerequisite: false,
        status: 'skipped',
        reason: 'needs-feature:x',
        note: text,
        durationMs: 0,
        assertions: 0,
      },
    ];
    const report = buildReport(steps, {
      plan: [],
      selection: { shard: null, grep: text },
      runId,
      startedAt: '',
      finishedAt: '',
      durationMs: 1,
      sdk: { version: '0', commit: '0' },
    });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-snippets-report-'));
    const savedSummary = process.env.GITHUB_STEP_SUMMARY;
    const summary = path.join(dir, 'step-summary.md');
    process.env.GITHUB_STEP_SUMMARY = summary;
    const written = writeReport(report, dir);
    if (savedSummary) process.env.GITHUB_STEP_SUMMARY = savedSummary;
    else delete process.env.GITHUB_STEP_SUMMARY;
    let leaks = 0;
    for (const file of written) {
      const content = fs.readFileSync(file, 'utf8');
      if (secrets.some((s) => content.includes(s)) || content.includes('0123abcd')) {
        leaks += 1;
        console.error(`leak in ${path.basename(file)}`);
      }
    }
    if (leaks > 0) fail('the reporter leaks key values');
    else
      console.log(
        `  ${written.length} files written (run.json, summary.md, step summary), ${secrets.length} known secret value(s) checked, no leak (${env.open || env.pam || env.datasync ? 'loaded keys included' : 'no keys loaded, fake values only'})`,
      );
    fs.rmSync(dir, { recursive: true, force: true });
  }

  heading('10. No key in any output (stdout, stderr, crashes, shortened values)');
  {
    // A child process with a fake secret that has every character a URL encodes. It writes the secret in each way the
    // security review named: split across writes, as a Uint8Array, URL-encoded, inside an object, in a URL-encoded token,
    // and finally in an uncaught exception outside Mocha. Nothing of it may reach the child's stdout or stderr.
    const secret = 'fake-Secret/Key+With=Specials0123456789';
    const token = `p0F2AkF0Gl${'A'.repeat(12)}%2B${'B'.repeat(20)}`;
    // A token granted with authorizedUserId has one more CBOR field, so it starts with `qEF2` instead of `p0F2`.
    const userToken = `qEF2AkF0GmkKbpZDdHRsAUNyZXOl${'C'.repeat(24)}`;
    const script = `
      const { installRedaction } = require(${JSON.stringify(path.join(SUITE_DIR, 'harness', 'redact.cjs'))});
      installRedaction();
      const s = process.env.DS_SECRET_KEY;
      process.stdout.write('split ' + s.slice(0, 9));
      process.stdout.write(s.slice(9) + '\\n');
      process.stdout.write(new TextEncoder().encode('bytes ' + s + '\\n'));
      console.log('url https://x/?k=' + encodeURIComponent(s));
      console.log('object', { config: { secretKey: s } });
      console.error('token ${token}');
      console.error('user token ${userToken} encoded ' + encodeURIComponent('${userToken}/x+y'));
      setTimeout(() => { throw new Error('boom ' + s); }, 10);
    `;
    const run = spawnSync(process.execPath, ['-e', script], {
      env: { PATH: process.env.PATH, DS_SECRET_KEY: secret },
      encoding: 'utf8',
    });
    const output = `${run.stdout}${run.stderr}`;
    const forms = [
      secret,
      encodeURIComponent(secret),
      encodeURIComponent(secret).toLowerCase(),
      secret.slice(9),
      token.slice(3),
      userToken.slice(4),
    ];
    const leaked = forms.filter((f) => output.includes(f)).length;
    if (leaked > 0) fail(`a child process printed ${leaked} form(s) of a secret`);
    if (!/split \[redacted\]/.test(output) || !/bytes \[redacted\]/.test(output) || !/k=\[redacted\]/.test(output))
      fail('split, byte array or URL-encoded output was not redacted in place');
    if (!/token \[token\]/.test(output)) fail('a URL-encoded token was not masked');
    if (!/user token \[token\] encoded \[token\]/.test(output))
      fail('a token with an authorized user id (qEF2) was not masked');
    if (run.status !== 1 || !/boom \[redacted\]/.test(output))
      fail(`an uncaught exception must print redacted and exit 1, got exit ${run.status}`);
    // Shortened values: the recorder cuts long values for the report. It must redact before it cuts.
    addSecrets([secret]);
    const { short } = await import('./recorder.js');
    const cut = short({ config: { secretKey: secret } }, 30);
    if (cut.includes(secret.slice(0, 12))) fail('the recorder cut a secret before redacting it');
    if (leaked === 0)
      console.log(
        '  split writes, byte arrays, URL-encoded keys and tokens, objects, uncaught exceptions and shortened values are all redacted',
      );
  }

  heading('11. The "keyset closed" probe counts only a 403 as refused');
  {
    const { tokenlessAccess } = await import('./revoke.js');
    const denied = Object.assign(new Error('Forbidden'), {
      status: { category: 'PNAccessDeniedCategory', statusCode: 403 },
    });
    const network = Object.assign(new Error('fetch failed'), { status: { category: 'PNNetworkIssuesCategory' } });
    const timeout = Object.assign(new Error('timed out'), { status: { category: 'PNTimeoutCategory' } });
    const server = Object.assign(new Error('Internal'), { status: { statusCode: 500 } });
    const bad = Object.assign(new Error('Bad request'), { status: { statusCode: 400 } });
    // A stand-in client: each call fails with the given error, or succeeds when it is undefined.
    const fake = (publishError?: Error, readError?: Error) =>
      ({
        publish: async () => {
          if (publishError) throw publishError;
          return { timetoken: '1' };
        },
        fetchMessages: async () => {
          if (readError) throw readError;
          return { channels: {} };
        },
      }) as never;
    const cases: Array<[string, Error | undefined, Error | undefined, 'closed' | 'open' | 'unknown']> = [
      ['both refused with 403', denied, denied, 'closed'],
      ['read open (application-level read grant)', denied, undefined, 'open'],
      ['read network error', denied, network, 'unknown'],
      ['read timeout', denied, timeout, 'unknown'],
      ['read 500', denied, server, 'unknown'],
      ['read 400', denied, bad, 'unknown'],
      ['publish network error', network, denied, 'unknown'],
    ];
    for (const [label, publishError, readError, expected] of cases) {
      const seen = await tokenlessAccess(fake(publishError, readError), 'probe');
      const verdict = seen.open.length > 0 ? 'open' : seen.unknown.length > 0 ? 'unknown' : 'closed';
      if (verdict !== expected) fail(`closure probe, ${label}: expected ${expected}, got ${verdict}`);
    }
    console.log(
      `  ${cases.length} cases: only a 403 on both probes reads as closed, network errors, timeouts, 5xx and 400 read as unknown`,
    );
  }

  heading('Result');
  console.log(failed ? 'dry run FAILED' : 'dry run ok');
  return failed ? 1 : 0;
}

/** `docs-snippets:manifest`: writes coverage.json, or with --check verifies it. Reports docs ids either way. */
async function manifest(): Promise<number> {
  const lint = lintApp(SUITE_DIR);
  if (lint.errors.length > 0) {
    printLint(lint);
    return 1;
  }
  const runId = randomRunId();
  const staged = stage(SUITE_DIR, runId);
  const plan = await stagedPlan(staged.runDir, loadEnv({}), runId);
  fs.rmSync(staged.runDir, { recursive: true, force: true });
  const { manifest: built, problems } = buildManifest(lint, plan.registry);
  const file = path.join(SUITE_DIR, 'coverage.json');
  const check = flags.has('--check');
  if (check) {
    if (!fs.existsSync(file)) problems.push('coverage.json does not exist, run npm run docs-snippets:manifest');
    else if (fs.readFileSync(file, 'utf8') !== serialize(built))
      problems.push('coverage.json is stale, run npm run docs-snippets:manifest');
  } else if (problems.length === 0) {
    fs.writeFileSync(file, serialize(built));
  }
  const modes = Object.values(built.snippets).reduce<Record<string, number>>(
    (acc, e) => ({ ...acc, [e.mode]: (acc[e.mode] ?? 0) + 1 }),
    {},
  );
  console.log(
    `manifest: ${Object.keys(built.snippets).length} entries (${Object.entries(modes)
      .map(([m, n]) => `${m} ${n}`)
      .join(', ')})${check ? '' : problems.length ? '' : ', written to docs-snippets/coverage.json'}`,
  );

  const docsDir = process.env.DOCS_SNIPPETS_DOCS_DIR || path.resolve(SUITE_DIR, '..', '..', 'documentation');
  const docs = docsIds(docsDir);
  if (!docs)
    console.log(`docs ids: skipped, ${docsDir}/docs/sdks/javascript does not exist (set DOCS_SNIPPETS_DOCS_DIR)`);
  else {
    const missing = [...docs.ids.keys()].filter((id) => !built.snippets[id]).sort();
    const unused = Object.keys(built.snippets)
      .filter((id) => !docs.ids.has(id))
      .sort();
    console.log(
      `docs ids: ${docs.ids.size} ids in ${docs.files} files of ${docsDir}/docs/sdks/javascript (report only)`,
    );
    console.log(
      `  docs ids missing from the manifest (${missing.length}): ${missing.map((id) => `${id} (${docs.ids.get(id)?.[0]})`).join(', ') || 'none'}`,
    );
    console.log(`  manifest ids no docs page uses (${unused.length}): ${unused.join(', ') || 'none'}`);
  }
  problems.forEach((p) => console.error(`manifest: ${p}`));
  return problems.length > 0 ? 1 : 0;
}

async function main(): Promise<number> {
  // Every command masks keys in its output, also the ones that only load keys for a self-test.
  installRedaction();
  switch (command) {
    case 'live':
      return live();
    case 'dry':
      return dryRun();
    case 'manifest':
      return manifest();
    case 'stage': {
      const result = stage(SUITE_DIR, loadEnv().runId ?? randomRunId(), {
        mutate: process.env.DOCS_SNIPPETS_MUTATE || undefined,
      });
      console.log(`staged ${result.filesCopied} files, ${result.rewrites.length} rewrites into ${result.runDir}`);
      result.problems.forEach((p) => console.error(p));
      return result.problems.length > 0 ? 1 : 0;
    }
    case 'lint': {
      const result = lintApp(SUITE_DIR);
      printLint(result);
      return result.errors.length > 0 ? 1 : 0;
    }
    case 'janitor': {
      installRedaction();
      const env = loadEnv();
      console.log(describeRoles(env));
      if (!env.open && !env.pam && !env.datasync) return env.ci ? 1 : 0;
      // A fresh run id of its own: only leftovers of other runs older than six hours are swept, plus the grants.
      const report = await runJanitor(env, randomRunId(), new Date(Date.now() - 60 * 60 * 1000));
      report.log.forEach((l) => console.log(l));
      report.critical.forEach((c) => console.error(`CRITICAL ${c}`));
      return report.critical.length > 0 ? 1 : 0;
    }
    default:
      console.error(`unknown command "${command}". Use live, dry, manifest, janitor, stage or lint.`);
      return 2;
  }
}

main().then(
  (code) => exitWhenIdle(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
