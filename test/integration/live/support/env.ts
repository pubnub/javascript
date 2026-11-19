/**
 * Keysets of the live tier, read from the environment. The names are the ones of the old harness:
 *
 *   role      env names
 *   open      SUBSCRIBE_KEY, PUBLISH_KEY
 *   pam       PAM_SUBSCRIBE_KEY, PAM_PUBLISH_KEY, PAM_SECRET_KEY
 *   datasync  DS_SUBSCRIBE_KEY, DS_PUBLISH_KEY, DS_SECRET_KEY
 *
 * Optional: PUBNUB_ADMIN_API_KEY and DOCS_SNIPPETS_OPEN_KEYSET_ID / DOCS_SNIPPETS_PAM_KEYSET_ID / DOCS_SNIPPETS_DS_KEYSET_ID (Admin
 * API: keyset feature check, DataSync provisioning). LIVE_JANITOR=off turns the before/after cleanup off, LIVE_PREFLIGHT=off the
 * preflight (see hooks.ts).
 *
 * Real environment variables win over the optional local file `test/integration/live/.env.local` (git ignores it), or the
 * file `LIVE_ENV_FILE` names. The file is read in memory and nothing here prints a key.
 */
import fs from 'node:fs';
import path from 'node:path';

export type Role = 'open' | 'pam' | 'datasync';
export const ROLES: readonly Role[] = ['open', 'pam', 'datasync'];

export interface OpenKeyset {
  publishKey: string;
  subscribeKey: string;
}

export interface SecuredKeyset extends OpenKeyset {
  secretKey: string;
}

const KEY_NAMES = {
  open: ['PUBLISH_KEY', 'SUBSCRIBE_KEY'],
  pam: ['PAM_PUBLISH_KEY', 'PAM_SUBSCRIBE_KEY', 'PAM_SECRET_KEY'],
  datasync: ['DS_PUBLISH_KEY', 'DS_SUBSCRIBE_KEY', 'DS_SECRET_KEY'],
} as const;

export const DEFAULT_ENV_FILE = path.resolve(__dirname, '..', '.env.local');

/** Minimal env file reader (`NAME=value`, `#` comments, optional quotes). */
export function readDotEnv(file: string): Record<string, string> {
  if (!file || !fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const name = line
      .slice(0, eq)
      .trim()
      .replace(/^export\s+/, '');
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[name] = value;
  }
  return out;
}

/** File values overlaid by the real environment. */
function source(): Record<string, string | undefined> {
  const named = process.env.LIVE_ENV_FILE?.trim();
  const file = named ? path.resolve(named) : DEFAULT_ENV_FILE;
  const out: Record<string, string | undefined> = { ...readDotEnv(file) };
  for (const [name, value] of Object.entries(process.env)) if (value) out[name] = value;
  return out;
}

export interface Env {
  open?: OpenKeyset;
  pam?: SecuredKeyset;
  datasync?: SecuredKeyset;
  /** Admin API key (Service Integration). Optional: only the feature check and provisioning use it. */
  adminKey?: string;
  /** Admin Portal keyset ids per role, for the feature check. Not secrets. */
  keysetIds: Partial<Record<Role, string>>;
  /** True when the pam and datasync roles are one keyset. */
  sharedSecured: boolean;
  /** Missing env names per role. Empty when the role is usable. */
  missing: Record<Role, string[]>;
}

export function loadEnv(vars: Record<string, string | undefined> = source()): Env {
  const read = (role: Role): { values: string[]; missing: string[] } => {
    const values: string[] = [];
    const missing: string[] = [];
    for (const name of KEY_NAMES[role]) {
      const value = vars[name]?.trim();
      if (value) values.push(value);
      else missing.push(name);
    }
    return { values, missing };
  };
  const open = read('open');
  const pam = read('pam');
  const ds = read('datasync');
  const secured = (r: { values: string[]; missing: string[] }): SecuredKeyset | undefined =>
    r.missing.length === 0 ? { publishKey: r.values[0], subscribeKey: r.values[1], secretKey: r.values[2] } : undefined;
  const pamKeys = secured(pam);
  const dsKeys = secured(ds);
  const id = (name: string): string | undefined => vars[name]?.trim() || undefined;
  return {
    open: open.missing.length === 0 ? { publishKey: open.values[0], subscribeKey: open.values[1] } : undefined,
    pam: pamKeys,
    datasync: dsKeys,
    adminKey: id('PUBNUB_ADMIN_API_KEY'),
    keysetIds: {
      open: id('DOCS_SNIPPETS_OPEN_KEYSET_ID'),
      pam: id('DOCS_SNIPPETS_PAM_KEYSET_ID'),
      datasync: id('DOCS_SNIPPETS_DS_KEYSET_ID'),
    },
    sharedSecured: Boolean(
      pamKeys && dsKeys && pamKeys.subscribeKey === dsKeys.subscribeKey && pamKeys.publishKey === dsKeys.publishKey,
    ),
    missing: { open: open.missing, pam: pam.missing, datasync: ds.missing },
  };
}

let cached: Env | undefined;

/** The environment of this process, read once. */
export function env(): Env {
  cached ??= loadEnv();
  return cached;
}

/** The keys of a role, or an error that names the missing env names. */
export function keysOf(role: 'open'): OpenKeyset;
export function keysOf(role: 'pam' | 'datasync'): SecuredKeyset;
export function keysOf(role: Role): OpenKeyset | SecuredKeyset;
export function keysOf(role: Role): OpenKeyset | SecuredKeyset {
  const keys = env()[role];
  if (!keys)
    throw new Error(`missing keys: the ${role} keyset is not configured, set ${env().missing[role].join(', ')}`);
  return keys;
}

/** "open set, pam missing, ...". Never a value, never a prefix of one. */
export function describeRoles(): string {
  return ROLES.map((role) => `${role} ${env()[role] ? 'set' : 'missing'}`).join(', ');
}

/** False only when `LIVE_JANITOR=off`: the cleanup before and after the run is skipped (single-page `--grep` runs). */
export function janitorEnabled(): boolean {
  return source().LIVE_JANITOR?.trim().toLowerCase() !== 'off';
}

/** False only when `LIVE_PREFLIGHT=off`. */
export function preflightEnabled(): boolean {
  return source().LIVE_PREFLIGHT?.trim().toLowerCase() !== 'off';
}

/**
 * Masks every key of the environment, the admin key, keys by shape and long token-like strings. Everything the janitor, the
 * preflight and the provisioning print goes through it, because SDK error messages can carry request URLs.
 */
export function redact(text: string): string {
  let out = text;
  const e = env();
  const secrets = [e.open, e.pam, e.datasync].flatMap((k) => (k ? Object.values(k) : []));
  if (e.adminKey) secrets.push(e.adminKey);
  for (const secret of secrets) if (secret.length >= 8) out = out.split(secret).join('***');
  return out.replace(/\b(?:sub|pub|sec)-c-[0-9a-f-]{20,}/gi, '***').replace(/\b[A-Za-z0-9_-]{60,}\b/g, '[long-token]');
}

/**
 * Real keys to spread into a sample inside a `snippet.hide` block, over the placeholder keys readers see. Typed `Partial`,
 * otherwise TypeScript reports the visible keys the spread overwrites (TS2783).
 */
export const openKeys = (): Partial<OpenKeyset> => ({ ...keysOf('open') });
export const securedKeys = (role: 'pam' | 'datasync' = 'pam'): Partial<SecuredKeyset> => ({ ...keysOf(role) });
export const subscribeKeyOnly = (): Partial<OpenKeyset> => ({ subscribeKey: keysOf('open').subscribeKey });
