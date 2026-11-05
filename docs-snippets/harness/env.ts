/**
 * The environment contract of the suite: keysets per role, the admin key, run id, log level, skip budget, required
 * features, the strict flag and the CI flag.
 *
 * One fixed set of names. The harness reads only these, wherever the value came from:
 *
 *   role      env names                                         used for
 *   open      SUBSCRIBE_KEY, PUBLISH_KEY                        most samples (no Access Manager)
 *   pam       PAM_SUBSCRIBE_KEY, PAM_PUBLISH_KEY, PAM_SECRET_KEY  Access Manager samples and 403 branches
 *   datasync  DS_SUBSCRIBE_KEY, DS_PUBLISH_KEY, DS_SECRET_KEY      DataSync samples
 *   admin     PUBNUB_ADMIN_API_KEY                              DataSync class setup and keyset feature reads
 *
 * Two sources fill them. In CI the workflow sets them from CI secrets. Locally an env file fills them: `docs-snippets/.env.local`
 * by default (copy `.env.example`), or the file `DOCS_SNIPPETS_ENV_FILE` names. It is read in memory and never copied or
 * rewritten. It may use the names above or the older `PN_DOCS_*` names, which are mapped as `FILE_ALIASES` says. Real environment variables always win, so a
 * CI run never reads a stray local file value.
 *
 * Output rule: nothing here prints a value or a prefix of one. `describeRoles` says "set" or "missing" per role.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addSecrets } from './redact.cjs';

/**
 * The default local env file: `docs-snippets/.env.local`, ignored by git. Copy `docs-snippets/.env.example` there and fill in
 * your own keys. `DOCS_SNIPPETS_ENV_FILE` points at another file instead. The CLI resolves this once and passes it on, because
 * the staged copy under `.run/<runId>/` sits in another directory.
 */
export const DEFAULT_ENV_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');

/** The roles a step can run as. `pam` and `datasync` may point at the same keyset (they do locally). */
export type Role = 'open' | 'pam' | 'datasync';
export const ROLES: readonly Role[] = ['open', 'pam', 'datasync'];

/** Key names per role, in the order publish, subscribe, secret. */
export const KEY_NAMES = {
  open: { publish: 'PUBLISH_KEY', subscribe: 'SUBSCRIBE_KEY' },
  pam: { publish: 'PAM_PUBLISH_KEY', subscribe: 'PAM_SUBSCRIBE_KEY', secret: 'PAM_SECRET_KEY' },
  datasync: { publish: 'DS_PUBLISH_KEY', subscribe: 'DS_SUBSCRIBE_KEY', secret: 'DS_SECRET_KEY' },
} as const;
export const ADMIN_KEY = 'PUBNUB_ADMIN_API_KEY';

/** Every env name that holds a secret. The redaction (redact.cjs) masks their values. */
export const SECRET_NAMES: readonly string[] = [
  KEY_NAMES.open.publish,
  KEY_NAMES.open.subscribe,
  KEY_NAMES.pam.publish,
  KEY_NAMES.pam.subscribe,
  KEY_NAMES.pam.secret,
  KEY_NAMES.datasync.publish,
  KEY_NAMES.datasync.subscribe,
  KEY_NAMES.datasync.secret,
  ADMIN_KEY,
];

/** Control variables. All start with `DOCS_SNIPPETS_`. */
export const ENV_VARS = {
  envFile: 'DOCS_SNIPPETS_ENV_FILE',
  runId: 'DOCS_SNIPPETS_RUN_ID',
  logLevel: 'DOCS_SNIPPETS_LOG_LEVEL',
  skipBudget: 'DOCS_SNIPPETS_SKIP_BUDGET',
  requireFeatures: 'DOCS_SNIPPETS_REQUIRE_FEATURES',
  strict: 'DOCS_SNIPPETS_STRICT',
  shard: 'DOCS_SNIPPETS_SHARD',
  openKeysetId: 'DOCS_SNIPPETS_OPEN_KEYSET_ID',
  pamKeysetId: 'DOCS_SNIPPETS_PAM_KEYSET_ID',
  datasyncKeysetId: 'DOCS_SNIPPETS_DS_KEYSET_ID',
} as const;

/**
 * The only place that knows the older `PN_DOCS_*` env names. A local env file that uses them works unchanged:
 * its open keyset fills `open`, its secured keyset fills both `pam` and `datasync`.
 */
export const FILE_ALIASES: Readonly<Record<string, string[]>> = {
  PUBLISH_KEY: ['PN_DOCS_OPEN_PUBLISH_KEY'],
  SUBSCRIBE_KEY: ['PN_DOCS_OPEN_SUBSCRIBE_KEY'],
  PAM_PUBLISH_KEY: ['PN_DOCS_SECURED_PUBLISH_KEY'],
  PAM_SUBSCRIBE_KEY: ['PN_DOCS_SECURED_SUBSCRIBE_KEY'],
  PAM_SECRET_KEY: ['PN_DOCS_SECURED_SECRET_KEY'],
  DS_PUBLISH_KEY: ['PN_DOCS_SECURED_PUBLISH_KEY'],
  DS_SUBSCRIBE_KEY: ['PN_DOCS_SECURED_SUBSCRIBE_KEY'],
  DS_SECRET_KEY: ['PN_DOCS_SECURED_SECRET_KEY'],
};

export interface OpenKeyset {
  publishKey: string;
  subscribeKey: string;
}

export interface SecuredKeyset extends OpenKeyset {
  secretKey: string;
}

export type LogLevelName = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface Env {
  open?: OpenKeyset;
  pam?: SecuredKeyset;
  datasync?: SecuredKeyset;
  /** Admin API key (Service Integration). Optional. Only provisioning and the read-only preflight use it. */
  adminKey?: string;
  /** Missing env names per role. Empty when the role is usable. */
  missing: Record<Role, string[]>;
  /** True when `pam` and `datasync` are the same keyset. Compared here, never printed. */
  sharedSecured: boolean;
  runId?: string;
  logLevel: LogLevelName;
  ci: boolean;
  /**
   * Most `blocked-by:*` skips a live run may report before it fails. Unset: 0 in CI and unlimited elsewhere.
   */
  skipBudget: number;
  skipBudgetProblem?: string;
  /** Features whose `needs-feature:<name>` skips fail the run (`DOCS_SNIPPETS_REQUIRE_FEATURES`). */
  requireFeatures: string[];
  /** `DOCS_SNIPPETS_STRICT=1`: every skip fails the run. */
  strict: boolean;
  /** `DOCS_SNIPPETS_SHARD=<role>`: the role whose steps this run selects. Undefined means all roles. */
  shard?: Role;
  shardProblem?: string;
  /** Where the env file came from, for the "set or missing" line. Never its content. */
  envFile?: string;
  /**
   * Admin Portal keyset ids per role, for the read-only feature preflight (keyset-features.ts). Not secrets. The preflight
   * confirms that each id's subscribe key equals the role's key before it relies on the id.
   */
  keysetIds: Partial<Record<Role, string>>;
}

/** Minimal env file reader. Values stay in memory. Real environment variables win (see `envSource`). */
export function readDotEnv(file: string): Record<string, string> {
  if (!file || !fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line
      .slice(0, eq)
      .trim()
      .replace(/^export\s+/, '');
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** Maps a local env file onto the suite's names. A name the file sets directly wins over an alias. */
function mapFile(file: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, aliases] of Object.entries(FILE_ALIASES)) {
    for (const alias of aliases) if (file[alias] && !out[name]) out[name] = file[alias];
  }
  for (const name of [...SECRET_NAMES, ...Object.values(ENV_VARS)]) if (file[name]) out[name] = file[name];
  return out;
}

/** File values (mapped) overlaid by the real environment. The env file path itself comes from the real environment only. */
export function envSource(vars: Record<string, string | undefined> = process.env): Record<string, string | undefined> {
  const file = vars[ENV_VARS.envFile]?.trim() || (fs.existsSync(DEFAULT_ENV_FILE) ? DEFAULT_ENV_FILE : undefined);
  const mapped = file ? mapFile(readDotEnv(path.resolve(file))) : {};
  const out: Record<string, string | undefined> = { ...mapped };
  for (const [key, value] of Object.entries(vars)) if (value !== undefined && value !== '') out[key] = value;
  return out;
}

function pick(source: Record<string, string | undefined>, names: string[]): { values: string[]; missing: string[] } {
  const values: string[] = [];
  const missing: string[] = [];
  for (const name of names) {
    const value = source[name]?.trim();
    if (value) values.push(value);
    else missing.push(name);
  }
  return { values, missing };
}

/**
 * Reads and validates the environment. Pure with respect to `source`, which is how the dry run builds CI, budget and
 * feature scenarios without touching the real environment. Registers every loaded secret with the redaction.
 */
export function loadEnv(source: Record<string, string | undefined> = envSource()): Env {
  const open = pick(source, [KEY_NAMES.open.publish, KEY_NAMES.open.subscribe]);
  const pam = pick(source, [KEY_NAMES.pam.publish, KEY_NAMES.pam.subscribe, KEY_NAMES.pam.secret]);
  const ds = pick(source, [KEY_NAMES.datasync.publish, KEY_NAMES.datasync.subscribe, KEY_NAMES.datasync.secret]);
  const adminKey = source[ADMIN_KEY]?.trim() || undefined;
  addSecrets([...open.values, ...pam.values, ...ds.values, adminKey]);

  const ci = Boolean(source.CI || source.GITHUB_ACTIONS);
  // An unknown level falls back to `none`, so a typo cannot make the SDK log its configuration (keys included).
  const rawLevel = (source[ENV_VARS.logLevel] ?? '').toLowerCase();
  const levels: LogLevelName[] = ['trace', 'debug', 'info', 'warn', 'error', 'none'];
  const logLevel = (levels as string[]).includes(rawLevel) ? (rawLevel as LogLevelName) : 'none';

  const rawBudget = source[ENV_VARS.skipBudget]?.trim();
  let skipBudget = ci ? 0 : Number.POSITIVE_INFINITY;
  let skipBudgetProblem: string | undefined;
  if (rawBudget) {
    if (/^\d+$/.test(rawBudget)) skipBudget = Number.parseInt(rawBudget, 10);
    else skipBudgetProblem = `${ENV_VARS.skipBudget}="${rawBudget}" is not a non-negative integer`;
  }

  const requireFeatures = (source[ENV_VARS.requireFeatures] ?? '')
    .split(',')
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean);

  const rawShard = source[ENV_VARS.shard]?.trim().toLowerCase();
  let shard: Role | undefined;
  let shardProblem: string | undefined;
  if (rawShard) {
    if ((ROLES as readonly string[]).includes(rawShard)) shard = rawShard as Role;
    else shardProblem = `${ENV_VARS.shard}="${rawShard}" is not one of ${ROLES.join(', ')}`;
  }

  let runId = source[ENV_VARS.runId]?.trim().toLowerCase();
  if (runId && !/^[0-9a-z]{6}$/.test(runId)) {
    // Reduce any other value to six base36 characters, so names stay valid for DataSync.
    runId = Number.parseInt(runId.replace(/\D/g, '') || '0', 10)
      .toString(36)
      .padStart(6, '0')
      .slice(-6);
  }

  const secured = (r: { values: string[]; missing: string[] }): SecuredKeyset | undefined =>
    r.missing.length === 0 ? { publishKey: r.values[0], subscribeKey: r.values[1], secretKey: r.values[2] } : undefined;
  const pamKeys = secured(pam);
  const dsKeys = secured(ds);
  return {
    open: open.missing.length === 0 ? { publishKey: open.values[0], subscribeKey: open.values[1] } : undefined,
    pam: pamKeys,
    datasync: dsKeys,
    adminKey,
    missing: { open: open.missing, pam: pam.missing, datasync: ds.missing },
    sharedSecured: Boolean(
      pamKeys && dsKeys && pamKeys.subscribeKey === dsKeys.subscribeKey && pamKeys.publishKey === dsKeys.publishKey,
    ),
    runId,
    logLevel,
    ci,
    skipBudget,
    skipBudgetProblem,
    requireFeatures,
    strict: source[ENV_VARS.strict] === '1',
    shard,
    shardProblem,
    envFile: source[ENV_VARS.envFile]?.trim() || undefined,
    keysetIds: {
      open: source[ENV_VARS.openKeysetId]?.trim() || undefined,
      pam: source[ENV_VARS.pamKeysetId]?.trim() || undefined,
      datasync: source[ENV_VARS.datasyncKeysetId]?.trim() || undefined,
    },
  };
}

/** Secured keysets to guard, without duplicates (pam and datasync may be one keyset). */
export function securedKeysets(env: Env): Array<{ role: 'pam' | 'datasync'; keys: SecuredKeyset }> {
  const out: Array<{ role: 'pam' | 'datasync'; keys: SecuredKeyset }> = [];
  if (env.pam) out.push({ role: 'pam', keys: env.pam });
  if (env.datasync && !env.sharedSecured) out.push({ role: 'datasync', keys: env.datasync });
  return out;
}

/** The loader's only output: "set" or "missing" per role. Never a value, never a prefix of one. */
export function describeRoles(env: Env): string {
  const parts = ROLES.map((role) => `${role} ${env[role] ? 'set' : 'missing'}`);
  parts.push(`admin ${env.adminKey ? 'set' : 'missing'}`);
  const from = env.envFile ? `, env file ${env.envFile}` : '';
  return `keysets: ${parts.join(', ')}${env.sharedSecured ? ' (pam and datasync are one keyset)' : ''}${from}`;
}

/**
 * Run ids carry their start time, so the janitor can tell a crashed run from a running one by pattern alone.
 * Five base36 characters count 4 second ticks since 2026-01-01 and one random character keeps runs of the same tick apart.
 * In CI a seventh character is not possible (DataSync and every name assume six), so CI runs mix the GitHub run id, attempt
 * and shard into the random part (see `ciRunId`).
 */
const RUN_ID_EPOCH = Date.UTC(2026, 0, 1);
const RUN_ID_TICK_MS = 4_000;
const RUN_ID_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function randomRunId(now: number = Date.now(), salt?: string): string {
  const ticks = Math.max(0, Math.floor((now - RUN_ID_EPOCH) / RUN_ID_TICK_MS)) % 36 ** 5;
  let last = Math.floor(Math.random() * 36);
  if (salt) {
    let hash = 0;
    for (const ch of salt) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    last = hash % 36;
  }
  return ticks.toString(36).padStart(5, '0') + last.toString(36);
}

/**
 * Run id for a CI job: the time tick plus one character derived from GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT and the shard. Three
 * shards start in the same tick, so the shard alone must separate them: the salt guarantees different characters for the
 * three shard names of one run attempt (checked by the dry run).
 */
export function ciRunId(
  vars: Record<string, string | undefined>,
  shard: string | undefined,
  now: number = Date.now(),
): string {
  const base = randomRunId(now).slice(0, 5);
  const shardIndex = shard ? Math.max(0, (ROLES as readonly string[]).indexOf(shard)) : 3;
  let hash = 0;
  for (const ch of `${vars.GITHUB_RUN_ID ?? ''}.${vars.GITHUB_RUN_ATTEMPT ?? ''}`)
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  // 9 slots of 4 characters: the run and attempt pick a slot, the shard picks a character inside it.
  const slot = hash % 9;
  return base + (slot * 4 + shardIndex).toString(36);
}

/** Age of a run id in ms, or undefined when it does not decode to the last year. Hand-written ids are never swept. */
export function runIdAgeMs(runId: string, now: number = Date.now()): number | undefined {
  if (!/^[0-9a-z]{6}$/.test(runId)) return undefined;
  const started = RUN_ID_EPOCH + Number.parseInt(runId.slice(0, 5), 36) * RUN_ID_TICK_MS;
  const age = now - started;
  return age >= -RUN_ID_TICK_MS && age <= RUN_ID_MAX_AGE_MS ? Math.max(0, age) : undefined;
}
