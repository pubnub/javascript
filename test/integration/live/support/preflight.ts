/**
 * Preflight: fails fast, with a message that names the missing keyset feature, before any test runs. The root `before all` hook
 * (hooks.ts) runs it after the janitor.
 *
 * 1. Admin API check (read only, never changes a keyset). With PUBNUB_ADMIN_API_KEY and a keyset id per role
 *    (DOCS_SNIPPETS_OPEN_KEYSET_ID, DOCS_SNIPPETS_PAM_KEYSET_ID, DOCS_SNIPPETS_DS_KEYSET_ID) it reads GET /v2/keysets/{id} and
 *    /config, confirms that the keyset of that id holds the role's subscribe key, and names every feature the role needs and lacks.
 *    Without the key or the id the role is skipped here and only the probes below run.
 * 2. Live probes on the open keyset, as the old harness did: keys and network (publish), Message Persistence (fetchMessages),
 *    Delete-From-History (deleteMessages on an empty range) and, when the Admin API did not vouch for it, Presence.
 */
import PubNub from 'pubnub';
import { env, redact, ROLES, type Env, type Role } from './env';
import { describeError, statusCode } from './janitor-util';

const BASE = 'https://admin-api.pubnub.com/v2/keysets';
const API_VERSION = '2026-09-17';

/** The part of the keyset configuration the tier needs. Field names as the Admin API returns them. */
interface KeysetConfig {
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

type FeatureRead =
  | { status: 'skipped'; why: string }
  | { status: 'mismatch' | 'error'; why: string }
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
export async function readFeatures(environment: Env, role: Role): Promise<FeatureRead> {
  const keys = environment[role];
  const id = environment.keysetIds[role];
  if (!environment.adminKey) return { status: 'skipped', why: 'PUBNUB_ADMIN_API_KEY is not set' };
  if (!id) return { status: 'skipped', why: `no keyset id for role ${role}` };
  if (!keys) return { status: 'skipped', why: `role ${role} has no keys` };
  const keyset = await get(`${BASE}/${encodeURIComponent(id)}`, environment.adminKey);
  if (keyset.status !== 200) return { status: 'error', why: `reading keyset ${id} answered HTTP ${keyset.status}` };
  // The only comparison of key material in this module. Only the boolean leaves it.
  if ((keyset.json as { subscribeKey?: unknown }).subscribeKey !== keys.subscribeKey)
    return { status: 'mismatch', why: `keyset ${id} does not hold the ${role} subscribe key` };
  const config = await get(`${BASE}/${encodeURIComponent(id)}/config`, environment.adminKey);
  if (config.status !== 200)
    return { status: 'error', why: `reading the configuration of keyset ${id} answered HTTP ${config.status}` };
  return { status: 'read', config: config.json as KeysetConfig };
}

/** Features a role needs (the live tier README, "Preflight"). One sentence per missing feature. */
export function missingFeatures(role: Role, c: KeysetConfig): string[] {
  const out: string[] = [];
  const on = (value: boolean | undefined, text: string): void => {
    if (value !== true) out.push(`${text} is off on the ${role} keyset`);
  };
  if (role === 'open') {
    on(c.presence?.enabled, 'Presence');
    on(
      c.presence?.rules?.some((r) => r.pattern === '*' && r.tracking?.enabled === true),
      'Presence tracking on all channels (rule pattern *)',
    );
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

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Live probes on the open keyset. Returns one sentence per failed probe; a failed publish stops the rest (keys or network). */
async function probeOpenKeyset(environment: Env, presenceVouched: boolean): Promise<string[]> {
  const keys = environment.open;
  if (!keys) return [];
  const problems: string[] = [];
  const client = new PubNub({
    ...keys,
    userId: 'preflight-observer',
    logLevel: PubNub.LogLevel.None,
    heartbeatInterval: 0,
  });
  const channel = 'preflight_channel';
  const probe = async (feature: string, setting: string, call: () => Promise<unknown>): Promise<boolean> => {
    try {
      await call();
      return true;
    } catch (error) {
      problems.push(
        `${feature} does not work on the open keyset (enable "${setting}" in the Admin Portal): ${describeError(error)}`,
      );
      return false;
    }
  };
  const subscriber = presenceVouched
    ? undefined
    : new PubNub({ ...keys, userId: 'preflight-presence', logLevel: PubNub.LogLevel.None, heartbeatInterval: 0 });
  try {
    if (
      !(await probe('Publish (working keys and network)', 'a publish and subscribe key pair', () =>
        client.publish({ channel, message: { preflight: true } }),
      ))
    )
      return problems;
    await probe('Message Persistence', 'Message Persistence', () =>
      client.fetchMessages({ channels: [channel], count: 1 }),
    );
    // Deleting an empty range has no side effect. 403 means the setting is off.
    await probe('Delete-From-History', 'Message Persistence > Delete-From-History', async () => {
      const now = (await client.time()).timetoken;
      await client.deleteMessages({ channel, start: (BigInt(now) - 1n).toString(), end: now });
    });
    if (subscriber) {
      subscriber.subscribe({ channels: [channel] });
      let seen = false;
      for (let attempt = 0; attempt < 10 && !seen; attempt += 1) {
        await sleep(1_500);
        try {
          const here = await client.hereNow({ channels: [channel] });
          seen = Boolean(here.channels[channel]?.occupants.some((o) => o.uuid === 'preflight-presence'));
        } catch (error) {
          if (statusCode(error) === 403) break;
        }
      }
      if (!seen)
        problems.push(
          'Presence does not work on the open keyset: hereNow does not list a subscribed client (enable "Presence")',
        );
    }
  } finally {
    subscriber?.destroy();
    client.destroy();
  }
  return problems;
}

/** Throws one error that lists every problem. `notes` returns the roles the Admin API could not check. */
export async function runPreflight(environment: Env = env()): Promise<{ notes: string[] }> {
  const problems: string[] = [];
  const notes: string[] = [];
  let openVouched = false;
  for (const role of ROLES) {
    if (!environment[role]) continue;
    const read = await readFeatures(environment, role).catch((error: unknown) => ({
      status: 'error' as const,
      why: describeError(error),
    }));
    if (read.status === 'read') {
      problems.push(...missingFeatures(role, read.config));
      if (role === 'open') openVouched = read.config.presence?.enabled === true;
    } else if (read.status === 'skipped') {
      notes.push(`${role}: Admin API feature check skipped (${read.why})`);
    } else {
      problems.push(`${role}: Admin API feature check failed: ${read.why}`);
    }
  }
  problems.push(...(await probeOpenKeyset(environment, openVouched)));
  if (problems.length > 0) {
    throw new Error(
      redact(
        `Keyset preflight failed. Fix these, then run again:\n${problems.map((p) => `  - ${p}`).join('\n')}\n` +
          'The features each keyset needs are listed in test/integration/live/README.md ("Preflight").',
      ),
    );
  }
  return { notes };
}
