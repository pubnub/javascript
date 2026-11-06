/**
 * Read-only keyset feature check through the Admin API. It never changes a keyset, an app or a key.
 *
 * With `PUBNUB_ADMIN_API_KEY` and a keyset id per role (`DOCS_SNIPPETS_OPEN_KEYSET_ID`, `DOCS_SNIPPETS_PAM_KEYSET_ID`,
 * `DOCS_SNIPPETS_DS_KEYSET_ID`), the preflight reads `GET /v2/keysets/{id}` and `GET /v2/keysets/{id}/config` (documented in
 * the docs repository, docs/admin-api/get-keyset-by-id.api.mdx and get-keyset-configuration.api.mdx). It first confirms
 * that the keyset of that id has the role's subscribe key. The comparison happens here and only its result is reported, never
 * a key or part of one. Then it names every feature the role needs and the keyset lacks.
 *
 * Without the key or the id, `readFeatures` returns `skipped` and the preflight probes with the SDK only.
 */
import type { Env, Role } from './env.js';

const BASE = 'https://admin-api.pubnub.com/v2/keysets';
const API_VERSION = '2026-09-17';

/** The part of the keyset configuration the suite needs. Field names as the Admin API returns them. */
export interface KeysetConfig {
  accessManager?: { enabled?: boolean; tokenRevoke?: boolean };
  files?: { enabled?: boolean };
  streamController?: { enabled?: boolean; wildcardSubscribe?: boolean };
  appContext?: {
    enabled?: boolean;
    userMetadataEvents?: boolean;
    channelMetadataEvents?: boolean;
    membershipEvents?: boolean;
    referentialIntegrity?: boolean;
    disallowGetAllChannelMetadata?: boolean;
    disallowGetAllUserMetadata?: boolean;
  };
  dataSync?: { enabled?: boolean };
  messagePersistence?: { enabled?: boolean; deleteFromHistory?: boolean };
  presence?: { enabled?: boolean; rules?: Array<{ pattern?: string; tracking?: { enabled?: boolean } }> };
}

export type FeatureRead =
  | { status: 'skipped'; why: string }
  | { status: 'mismatch'; why: string }
  | { status: 'error'; why: string }
  | { status: 'read'; config: KeysetConfig };

async function get(url: string, apiKey: string): Promise<{ status: number; json: unknown }> {
  const response = await fetch(url, { headers: { Authorization: apiKey, 'PubNub-Version': API_VERSION } });
  const text = await response.text();
  try {
    return { status: response.status, json: text ? JSON.parse(text) : {} };
  } catch {
    return { status: response.status, json: {} };
  }
}

/** Reads a role's keyset configuration. Never returns or logs key material. */
export async function readFeatures(env: Env, role: Role): Promise<FeatureRead> {
  const keys = env[role];
  const id = env.keysetIds[role];
  if (!env.adminKey) return { status: 'skipped', why: 'PUBNUB_ADMIN_API_KEY is not set' };
  if (!id) return { status: 'skipped', why: `no keyset id for role ${role}` };
  if (!keys) return { status: 'skipped', why: `role ${role} has no keys` };
  const keyset = await get(`${BASE}/${encodeURIComponent(id)}`, env.adminKey);
  if (keyset.status !== 200) return { status: 'error', why: `reading keyset ${id} answered HTTP ${keyset.status}` };
  const subscribeKey = (keyset.json as { subscribeKey?: unknown }).subscribeKey;
  // The only comparison of key material in this module. Only the boolean leaves it.
  if (subscribeKey !== keys.subscribeKey)
    return { status: 'mismatch', why: `keyset ${id} does not hold the ${role} subscribe key` };
  const config = await get(`${BASE}/${encodeURIComponent(id)}/config`, env.adminKey);
  if (config.status !== 200)
    return { status: 'error', why: `reading the configuration of keyset ${id} answered HTTP ${config.status}` };
  return { status: 'read', config: config.json as KeysetConfig };
}

/** Features a role needs, as named in docs-snippets/README.md. Returns one sentence per missing feature. */
export function missingFeatures(role: Role, c: KeysetConfig): string[] {
  const out: string[] = [];
  const on = (value: boolean | undefined, text: string): void => {
    if (value !== true) out.push(`${text} is off on the ${role} keyset`);
  };
  if (role === 'open') {
    on(c.presence?.enabled, 'Presence');
    const wildcard = c.presence?.rules?.some((r) => r.pattern === '*' && r.tracking?.enabled === true);
    on(wildcard, 'Presence tracking on all channels (rule pattern *)');
    on(c.messagePersistence?.enabled, 'Message Persistence');
    on(c.messagePersistence?.deleteFromHistory, 'Message Persistence Delete-From-History');
    on(c.appContext?.enabled, 'App Context');
    on(c.appContext?.userMetadataEvents, 'App Context user metadata events');
    on(c.appContext?.channelMetadataEvents, 'App Context channel metadata events');
    on(c.appContext?.membershipEvents, 'App Context membership events');
    if (c.appContext?.referentialIntegrity === true)
      out.push('App Context referential integrity is on on the open keyset (it must be off)');
    if (c.appContext?.disallowGetAllUserMetadata === true || c.appContext?.disallowGetAllChannelMetadata === true)
      out.push('App Context "disallow get all" is on on the open keyset (it must be off)');
    on(c.files?.enabled, 'Files');
    on(c.streamController?.enabled, 'Stream Controller');
    on(c.streamController?.wildcardSubscribe, 'Stream Controller wildcard subscribe');
    if (c.accessManager?.enabled === true) out.push('Access Manager is on on the open keyset (it must be off)');
  } else {
    on(c.accessManager?.enabled, 'Access Manager');
    if (role === 'pam') on(c.accessManager?.tokenRevoke, 'Access Manager token revocation');
    on(c.messagePersistence?.enabled, 'Message Persistence');
    on(c.presence?.enabled, 'Presence');
    if (role === 'datasync') on(c.dataSync?.enabled, 'DataSync');
  }
  return out;
}
