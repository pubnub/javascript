/**
 * The API groups of the live tier (../groups.cjs), typed, plus two command line modes:
 *
 *   tsx test/integration/live/support/groups.ts --check            fails when a test file is in no group or in two groups, a listed
 *                                                                   file is missing, a file sits in the wrong tier, a file uses a
 *                                                                   role its group does not list, or the workflow's `group` input
 *                                                                   options differ from the group names (part of the lint script)
 *   tsx test/integration/live/support/groups.ts --matrix <name|all>  prints the job matrix of the "Live tests" workflow as JSON
 *
 * The check is what keeps a new test file from being dropped silently: CI runs only the files of the groups.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Role } from './env';

export type Tier = 'docs' | 'endpoints';

export interface LiveGroup {
  name: string;
  tier: Tier;
  /** Keyset roles the group's tests use. A group run without --grep needs all of them up front. */
  roles: Role[];
  /** Paths relative to test/integration/live/. */
  files: string[];
}

export const LIVE_DIR = path.resolve(__dirname, '..');
const WORKFLOW = path.resolve(LIVE_DIR, '../../../.github/workflows/live-integration.yml');

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const GROUPS = require('../groups.cjs') as readonly LiveGroup[];

/** The group LIVE_GROUP names, or undefined when it is not set. The Mocha configs already reject an unknown name. */
export function selectedGroup(): LiveGroup | undefined {
  const name = process.env.LIVE_GROUP?.trim();
  return name ? GROUPS.find((g) => g.name === name) : undefined;
}

/** Every *.test.ts file of the tier, relative to LIVE_DIR, with forward slashes. */
function testFiles(dir = LIVE_DIR): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...testFiles(full));
    else if (entry.name.endsWith('.test.ts')) out.push(path.relative(LIVE_DIR, full).split(path.sep).join('/'));
  }
  return out.sort();
}

/**
 * Roles a file visibly uses (a lower bound: it can miss a role, it never invents one). `server()` without a role is the pam keyset.
 */
const ROLE_USE: Record<Exclude<Role, 'open'>, RegExp> = {
  pam: /\bserver\(\s*(\)|'pam')|createClient\(\s*'pam'|keysOf\(\s*'pam'|securedKeys\(\s*(\)|'pam')/,
  datasync: /\bserver\(\s*'datasync'|createClient\(\s*'datasync'|keysOf\(\s*'datasync'|securedKeys\(\s*'datasync'/,
};

/** The `group` options of the workflow's workflow_dispatch input, or undefined when the workflow has none. */
function workflowGroupOptions(): string[] | undefined {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const yaml = require('js-yaml') as { safeLoad(text: string): unknown };
  const doc = yaml.safeLoad(fs.readFileSync(WORKFLOW, 'utf8')) as {
    on?: { workflow_dispatch?: { inputs?: { group?: { options?: string[] } } } };
  };
  return doc.on?.workflow_dispatch?.inputs?.group?.options;
}

/** Problems, one sentence each. Empty when the groups are consistent. */
export function checkGroups(groups: readonly LiveGroup[] = GROUPS): string[] {
  const problems: string[] = [];
  const owner = new Map<string, string>();
  const names = new Set<string>();
  for (const group of groups) {
    if (!/^[a-z0-9-]+$/.test(group.name)) problems.push(`group "${group.name}": the name must match [a-z0-9-]+`);
    if (names.has(group.name)) problems.push(`group "${group.name}" is defined twice`);
    names.add(group.name);
    if (group.tier !== 'docs' && group.tier !== 'endpoints')
      problems.push(`group "${group.name}": tier must be 'docs' or 'endpoints'`);
    if (group.tier === 'docs' && !group.roles.includes('open'))
      problems.push(`group "${group.name}": a docs-tier run always needs the open role, list it`);
    if (group.files.length === 0) problems.push(`group "${group.name}" has no files`);
    for (const file of group.files) {
      const previous = owner.get(file);
      if (previous) problems.push(`${file} is in two groups: ${previous} and ${group.name}`);
      owner.set(file, group.name);
      const full = path.join(LIVE_DIR, file);
      if (!fs.existsSync(full)) {
        problems.push(`group "${group.name}": ${file} does not exist`);
        continue;
      }
      if ((group.tier === 'endpoints') !== file.startsWith('endpoints/'))
        problems.push(`group "${group.name}" (tier ${group.tier}): ${file} belongs to the other tier`);
      const source = fs.readFileSync(full, 'utf8');
      for (const [role, pattern] of Object.entries(ROLE_USE) as Array<[Role, RegExp]>)
        if (pattern.test(source) && !group.roles.includes(role))
          problems.push(`group "${group.name}": ${file} uses the ${role} keyset, add '${role}' to the group's roles`);
    }
  }
  for (const file of testFiles())
    if (!owner.has(file))
      problems.push(
        `${file} is in no group: add it to a group in test/integration/live/groups.cjs, or CI never runs it`,
      );
  const options = workflowGroupOptions();
  const expected = ['all', ...groups.map((g) => g.name)];
  if (!options) problems.push('the workflow live-integration.yml has no workflow_dispatch input `group` with options');
  else if (options.join(',') !== expected.join(','))
    problems.push(
      `the workflow input \`group\` options (${options.join(', ')}) must be, in this order: ${expected.join(', ')}`,
    );
  return problems;
}

/** The job matrix of the workflow: every group, or the one named. `provision` marks docs-tier groups that use DataSync classes. */
export function matrixOf(selection: string, groups: readonly LiveGroup[] = GROUPS) {
  const chosen = selection === 'all' || selection === '' ? groups : groups.filter((g) => g.name === selection);
  if (chosen.length === 0) throw new Error(`no group named "${selection}" in groups.cjs`);
  return {
    include: chosen.map((g) => ({
      group: g.name,
      tier: g.tier,
      provision: g.tier === 'docs' && g.roles.includes('datasync'),
    })),
  };
}

function main(argv: string[]): number {
  if (argv[0] === '--check') {
    const problems = checkGroups();
    if (problems.length) {
      problems.forEach((p) => console.error(`groups: ${p}`));
      return 1;
    }
    const files = GROUPS.reduce((n, g) => n + g.files.length, 0);
    console.log(`groups: ${GROUPS.length} groups cover all ${files} test files, each file once`);
    return 0;
  }
  if (argv[0] === '--matrix') {
    console.log(JSON.stringify(matrixOf(argv[1] ?? 'all')));
    return 0;
  }
  console.error('usage: groups.ts --check | --matrix <group|all>');
  return 2;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));
