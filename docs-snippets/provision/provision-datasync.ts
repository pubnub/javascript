import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeRoles, loadEnv, type Env } from '../harness/env.js';
import { installRedaction, redact } from '../harness/redact.cjs';

/**
 * Sets up the DataSync classes of the datasync keyset from `datasync-classes.json`.
 *
 *   npm run docs-snippets:provision               creates missing classes, updates classes whose mutable fields drifted
 *   npm run docs-snippets:provision -- --check    no-write diff, exit code 1 when anything differs
 *
 * The live suite calls `provisionDataSync` first in every run that includes the datasync role, before preflight and before any
 * step (harness/cli.ts).
 *
 * Rules:
 * - Never deletes a class. A class whose immutable fields differ (relationship cardinality or entity sides) fails with the
 *   diff, because only a person may recreate it.
 * - Idempotent. A second run reports every class as unchanged and writes nothing.
 * - Touches only the classes in datasync-classes.json. Classes other tests use on a shared keyset (for example the `JS*`
 *   classes of test/integration/endpoints/data_sync/helpers.ts) are never read for changes and never written.
 * - Without PUBNUB_ADMIN_API_KEY it still checks, through the SDK with the datasync keys, and a missing class fails with its
 *   name. The DataSync steps are never skipped silently.
 * - The per class event switch ("Select entities to sync") has no Admin API endpoint. It stays a feature probe
 *   (`needs-feature:datasync-events`, step datasyncEvents).
 * - Output never contains a key or part of one.
 *
 * Admin API auth is the raw key in the `Authorization` header (no `Bearer`) plus `PubNub-Version`.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://admin-api.pubnub.com/v2/datasync/subkeys';
const API_VERSION = '2026-09-17';
const ENTITY_TYPE = 'application/vnd.pubnub.objects.entity-class+json;version=1';
const RELATIONSHIP_TYPE = 'application/vnd.pubnub.objects.relationship-class+json;version=1';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Obj = { [key: string]: Json };

interface Desired {
  entityClasses: Obj[];
  relationshipClasses: Obj[];
  expectedBuiltIns: { entityClasses: Obj[]; relationshipClasses: Obj[] };
}

interface Action {
  kind: 'entity' | 'relationship';
  op: 'create' | 'replace' | 'unchanged' | 'blocked';
  name: string;
  version: number;
  diff: string[];
  body?: Obj;
}

export interface ProvisionResult {
  ok: boolean;
  /** Lines for the console. No key material. */
  log: string[];
  /** What failed the setup, one line each. */
  problems: string[];
  /** Number of POST and PUT calls made. 0 on a second run. */
  writes: number;
}

async function request(
  method: string,
  url: string,
  apiKey: string,
  contentType?: string,
  body?: Obj,
): Promise<{ status: number; json: Obj }> {
  const headers: Record<string, string> = { Authorization: apiKey, 'PubNub-Version': API_VERSION };
  if (contentType) headers['Content-Type'] = contentType;
  const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await response.text();
  let json: Obj = {};
  try {
    json = text ? (JSON.parse(text) as Obj) : {};
  } catch {
    // Redact first, then cut: a key cut in half would match neither its literal value nor its shape.
    json = { raw: redact(text).slice(0, 200) };
  }
  return { status: response.status, json };
}

/** Subset comparison: every key in `desired` must match in `actual`. Arrays compare element by element. */
function differences(actual: Json | undefined, desired: Json, where: string): string[] {
  if (Array.isArray(desired)) {
    if (!Array.isArray(actual)) return [`${where}: expected an array, found ${JSON.stringify(actual)}`];
    const out: string[] = [];
    if (actual.length !== desired.length)
      out.push(`${where}: expected ${desired.length} item(s), found ${actual.length}`);
    desired.forEach((item, i) => {
      const named = typeof item === 'object' && item !== null && 'name' in item;
      const label = named ? `${where}[${(item as Obj).name}]` : `${where}[${i}]`;
      const match = named ? actual.find((a) => (a as Obj)?.name === (item as Obj).name) : actual[i];
      out.push(...differences(match, item, label));
    });
    return out;
  }
  if (desired !== null && typeof desired === 'object') {
    if (actual === null || typeof actual !== 'object' || Array.isArray(actual))
      return [`${where}: expected an object, found ${JSON.stringify(actual)}`];
    return Object.entries(desired).flatMap(([key, value]) =>
      differences((actual as Obj)[key], value, where ? `${where}.${key}` : key),
    );
  }
  return actual === desired ? [] : [`${where}: ${JSON.stringify(actual)} -> ${JSON.stringify(desired)}`];
}

function listOf(json: Obj): Obj[] {
  return Array.isArray(json.data) ? (json.data as Obj[]) : [];
}

function entityBody(d: Obj): Obj {
  const data: Obj = { config: d.config as Json, properties: d.properties as Json };
  if (d.description) data.description = d.description;
  return { data };
}

function relationshipCreateBody(d: Obj): Obj {
  const data: Obj = { cardinality: d.cardinality as Json };
  for (const key of [
    'description',
    'entityAClass',
    'entityAClassLevel',
    'entityBClass',
    'entityBClassLevel',
    'properties',
  ]) {
    if (d[key] !== undefined) data[key] = d[key] as Json;
  }
  return { data };
}

function relationshipReplaceBody(d: Obj): Obj {
  const data: Obj = {};
  if (d.description) data.description = d.description;
  if (d.properties) data.properties = d.properties;
  return { data };
}

function desiredClasses(): Desired {
  return JSON.parse(fs.readFileSync(path.join(HERE, 'datasync-classes.json'), 'utf8')) as Desired;
}

/** Without an admin key: check through the SDK that each class exists. Never writes. */
async function checkWithSdk(env: Env, desired: Desired): Promise<ProvisionResult> {
  const log: string[] = [
    'PUBNUB_ADMIN_API_KEY is not set: checking the classes through the SDK with the datasync keys (no writes)',
  ];
  const problems: string[] = [];
  const keys = env.datasync;
  if (!keys)
    return {
      ok: false,
      log,
      problems: ['the datasync keyset is not configured (DS_PUBLISH_KEY, DS_SUBSCRIBE_KEY, DS_SECRET_KEY)'],
      writes: 0,
    };
  const { default: PubNub } = await import('pubnub');
  const client = new PubNub({
    ...keys,
    userId: 'docs-snippets-provision-check',
    logLevel: PubNub.LogLevel.None,
    heartbeatInterval: 0,
  });
  try {
    for (const d of desired.entityClasses) {
      try {
        await client.dataSync.getEntities({ class: String(d.name), classVersion: Number(d.version), limit: 1 });
        log.push(`  = entity class ${d.name} v${d.version} exists`);
      } catch (error) {
        problems.push(
          `DataSync entity class ${d.name} v${d.version} is missing on the datasync keyset (${(error as { status?: { statusCode?: number } }).status?.statusCode ?? (error as Error).message}). Set PUBNUB_ADMIN_API_KEY and run npm run docs-snippets:provision.`,
        );
      }
    }
    for (const d of desired.relationshipClasses) {
      try {
        await client.dataSync.getRelationships({ class: String(d.name), classVersion: Number(d.version), limit: 1 });
        log.push(`  = relationship class ${d.name} v${d.version} exists`);
      } catch (error) {
        problems.push(
          `DataSync relationship class ${d.name} v${d.version} is missing on the datasync keyset (${(error as { status?: { statusCode?: number } }).status?.statusCode ?? (error as Error).message}). Set PUBNUB_ADMIN_API_KEY and run npm run docs-snippets:provision.`,
        );
      }
    }
  } finally {
    client.destroy();
  }
  return { ok: problems.length === 0, log, problems, writes: 0 };
}

/**
 * Reads the live classes, compares them with datasync-classes.json and, unless `check`, creates missing classes and updates
 * drifted mutable fields. See the header for the rules.
 */
export async function provisionDataSync(env: Env, options: { check: boolean }): Promise<ProvisionResult> {
  const desired = desiredClasses();
  if (!env.adminKey) return checkWithSdk(env, desired);
  const log: string[] = [];
  const problems: string[] = [];
  const subKey = env.datasync?.subscribeKey;
  if (!subKey)
    return { ok: false, log, problems: ['the datasync keyset is not configured (DS_SUBSCRIBE_KEY)'], writes: 0 };
  const apiKey = env.adminKey;
  const entities = await request('GET', `${BASE}/${subKey}/entity-classes`, apiKey);
  const relationships = await request('GET', `${BASE}/${subKey}/relationship-classes`, apiKey);
  if (entities.status !== 200 || relationships.status !== 200) {
    const hint =
      entities.status === 403 || relationships.status === 403
        ? ' The Service Integration needs a DataSync permission row (Keyset level, Read & write) for the datasync keyset.'
        : '';
    return {
      ok: false,
      log,
      problems: [
        `could not read the live classes: entity-classes HTTP ${entities.status}, relationship-classes HTTP ${relationships.status}.${hint}`,
      ],
      writes: 0,
    };
  }
  const liveEntities = listOf(entities.json);
  const liveRelationships = listOf(relationships.json);
  log.push(
    `datasync keyset: ${liveEntities.length} entity class(es), ${liveRelationships.length} relationship class(es) live`,
  );

  for (const builtIn of desired.expectedBuiltIns.entityClasses) {
    if (!liveEntities.some((c) => c.name === builtIn.name && c.version === builtIn.version))
      problems.push(
        `built-in entity class ${builtIn.name} v${builtIn.version} is missing, so DataSync is off on the datasync keyset`,
      );
  }
  for (const builtIn of desired.expectedBuiltIns.relationshipClasses) {
    if (!liveRelationships.some((c) => c.name === builtIn.name && c.version === builtIn.version))
      problems.push(
        `built-in relationship class ${builtIn.name} v${builtIn.version} is missing, so DataSync is off on the datasync keyset`,
      );
  }

  const actions: Action[] = [];
  for (const d of desired.entityClasses) {
    const live = liveEntities.find((c) => c.name === d.name && c.version === d.version && c.level === 'SubKey');
    const { name, version, ...comparable } = d;
    void name;
    void version;
    if (!live)
      actions.push({
        kind: 'entity',
        op: 'create',
        name: String(d.name),
        version: Number(d.version),
        diff: ['(new class)'],
        body: entityBody(d),
      });
    else {
      const diff = differences(live as Json, comparable as Json, '');
      actions.push({
        kind: 'entity',
        op: diff.length ? 'replace' : 'unchanged',
        name: String(d.name),
        version: Number(d.version),
        diff,
        body: entityBody(d),
      });
    }
  }
  for (const d of desired.relationshipClasses) {
    const live = liveRelationships.find((c) => c.name === d.name && c.version === d.version);
    const { name, version, ...comparable } = d;
    void name;
    void version;
    if (!live)
      actions.push({
        kind: 'relationship',
        op: 'create',
        name: String(d.name),
        version: Number(d.version),
        diff: ['(new class)'],
        body: relationshipCreateBody(d),
      });
    else {
      const diff = differences(live as Json, comparable as Json, '');
      const immutable = diff.filter((line) => /^(cardinality|entityA|entityB)/.test(line));
      if (immutable.length)
        actions.push({
          kind: 'relationship',
          op: 'blocked',
          name: String(d.name),
          version: Number(d.version),
          diff: immutable,
        });
      else
        actions.push({
          kind: 'relationship',
          op: diff.length ? 'replace' : 'unchanged',
          name: String(d.name),
          version: Number(d.version),
          diff,
          body: relationshipReplaceBody(d),
        });
    }
  }

  for (const a of actions) {
    const symbol = { create: '+', replace: '~', unchanged: '=', blocked: '!' }[a.op];
    log.push(`  ${symbol} ${a.kind} class ${a.name} v${a.version} [${a.op}]`);
    if (a.op !== 'unchanged') for (const line of a.diff) log.push(`      ${line}`);
  }
  for (const a of actions.filter((x) => x.op === 'blocked')) {
    problems.push(
      `${a.kind} class ${a.name} v${a.version} differs in an immutable field (${a.diff.join('; ')}). Only a person may delete and recreate it.`,
    );
  }

  const pending = actions.filter((a) => a.op === 'create' || a.op === 'replace');
  let writes = 0;
  if (options.check) {
    log.push(
      pending.length
        ? `check: ${pending.length} change(s) would be written, nothing was written`
        : 'check: every class is unchanged',
    );
    for (const a of pending)
      problems.push(`${a.kind} class ${a.name} v${a.version} would be ${a.op === 'create' ? 'created' : 'updated'}`);
  } else {
    for (const a of pending) {
      const dir = a.kind === 'entity' ? 'entity-classes' : 'relationship-classes';
      const url = `${BASE}/${subKey}/${dir}/${encodeURIComponent(a.name)}/versions/${a.version}`;
      const type = a.kind === 'entity' ? ENTITY_TYPE : RELATIONSHIP_TYPE;
      const result = await request(a.op === 'create' ? 'POST' : 'PUT', url, apiKey, type, a.body);
      writes += 1;
      const ok = result.status === 200 || result.status === 201;
      log.push(`  ${a.op === 'create' ? 'POST' : 'PUT'} ${a.kind} ${a.name} v${a.version}: HTTP ${result.status}`);
      if (!ok)
        problems.push(
          `${a.op} of ${a.kind} class ${a.name} v${a.version} failed with HTTP ${result.status}: ${redact(JSON.stringify(result.json)).slice(0, 300)}`,
        );
    }
    log.push(`${writes} write(s), ${actions.filter((a) => a.op === 'unchanged').length} class(es) unchanged`);
  }
  return { ok: problems.length === 0, log, problems, writes };
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  installRedaction();
  const env = loadEnv();
  console.log(describeRoles(env));
  provisionDataSync(env, { check: process.argv.includes('--check') }).then(
    (result) => {
      result.log.forEach((line) => console.log(line));
      result.problems.forEach((p) => console.error(`problem: ${p}`));
      process.exitCode = result.ok ? 0 : 1;
    },
    (error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    },
  );
}
