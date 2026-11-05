/**
 * Step registry: the single source of truth for what the suite will run and in which order.
 *
 * Page modules register steps through `step()`, `check()` and `stub()` (step.ts). The registry validates the wiring
 * (ids unique, `needs` point at earlier steps), sorts by phase, and answers one question for the Mocha binding:
 * "may this step run now?" (`skipReason`). It also remembers each step's result, because `needs` is evaluated against
 * results at run time: a step runs only when every step it needs has passed.
 *
 * The dry run drives the very same code with fake bodies (`simulate`), so skip-on-upstream-failure is proven without
 * a network. There is exactly one registry per process (the exported `registry`). The staged copy under
 * `.run/<runId>/` loads its own instance of this module, which is why `cli.ts dry-run` imports the registry back out
 * of the staged `run.ts` before inspecting it.
 */
import type { Role } from './env.js';
import { assertAllowedSkip } from './skips.js';

/** Phases P0 to P9 run in this order. */
export type Phase = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9';
export const PHASES: readonly Phase[] = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
/**
 * The role a step runs as, which decides its keyset and env names (env.ts): `open` has no Access Manager, `pam` has Access
 * Manager (v2 and v3), `datasync` has DataSync classes plus Access Manager. An older layout had one `secured` keyset, which is
 * split here into `pam` and `datasync`.
 */
export type Keyset = Role;
export type StepStatus = 'passed' | 'failed' | 'skipped' | 'pending';

export interface StepOptions {
  /** Ids of steps that must have passed. Otherwise this step is skipped with `blocked-by:<id>`. */
  needs?: string[];
  /** Overrides the page phase. */
  phase?: Phase;
  /** Role (keyset) the step talks to. Defaults to `open`. */
  keyset?: Keyset;
  /** Allowed skip reason (see skips.ts). The step is registered, type-checked and reported as skipped. */
  skipIf?: string;
  /** Snippet ids the step runs. Defaults to `[id]`. Must equal the markers inside the step body (lint). */
  snippets?: string[];
  /** Mocha timeout in ms. Defaults to 30000. */
  timeout?: number;
  /**
   * One short sentence for the run report: what this step proves. Written from the comment block above the step. It is
   * shown next to the step in report/<runId>.md and .html, so a reader sees intent without opening the code.
   */
  proves?: string;
}

export interface StepDef {
  id: string;
  /** Page path such as `api-reference/publish`. */
  page: string;
  phase: Phase;
  keyset: Keyset;
  needs: string[];
  skipIf?: string;
  /** Snippet ids. Empty for `check()` steps. */
  snippets: string[];
  kind: 'step' | 'check' | 'stub';
  timeout: number;
  /** One-line description for the report, see `StepOptions.proves`. */
  proves?: string;
  fn: () => Promise<void> | void;
  /** Position in registration order. */
  order: number;
}

export interface StepResult {
  status: StepStatus;
  reason?: string;
  error?: string;
  durationMs?: number;
}

export type Availability = Record<Role, boolean>;

/** What a filtered run executes: the selected steps plus the steps they need that the filter left out. */
export interface Selection {
  /** Step ids that run, in run order. */
  run: Set<string>;
  /** Ids that run only because a selected step needs them. Reported as prerequisites, not as passed tests. */
  prerequisites: Set<string>;
  /** Ids the filter left out and nothing needs. */
  notSelected: Set<string>;
}

/** Collects steps, validates their wiring, orders them by phase and tracks results for `needs`. */
export class Registry {
  private steps = new Map<string, StepDef>();
  private results = new Map<string, StepResult>();
  private currentPage = '(none)';
  private currentPhase: Phase = 'P4';
  /** Which keysets have keys. A step on a missing keyset skips as `missing-env:<keyset>` instead of failing. */
  availability: Availability = { open: true, pam: true, datasync: true };

  reset(): void {
    this.steps.clear();
    this.results.clear();
    this.currentPage = '(none)';
  }

  /** Sets the page and default phase that `add` stamps on steps while `fn` runs (a page's `setup` callback). Restores them after. */
  withPage<T>(page: string, phase: Phase, fn: () => T): T {
    const previous = [this.currentPage, this.currentPhase] as const;
    this.currentPage = page;
    this.currentPhase = phase;
    try {
      return fn();
    } finally {
      [this.currentPage, this.currentPhase] = previous;
    }
  }

  add(
    kind: StepDef['kind'],
    id: string,
    options: StepOptions,
    fn: StepDef['fn'],
  ): StepDef {
    // Same character set as snippet ids. The id doubles as the Mocha test title and the key in report JSON.
    if (!/^[A-Za-z0-9_/-]+$/.test(id)) throw new Error(`step id "${id}" is not a valid snippet id`);
    if (this.steps.has(id)) throw new Error(`duplicate step id "${id}" (already registered by ${this.steps.get(id)!.page})`);
    if (options.skipIf) assertAllowedSkip(options.skipIf, `step ${id}`);
    const def: StepDef = {
      id,
      page: this.currentPage,
      phase: options.phase ?? this.currentPhase,
      keyset: options.keyset ?? 'open',
      needs: options.needs ?? [],
      skipIf: options.skipIf,
      // check() and stub() own no snippets, so the lint can assert they contain no markers.
      snippets: kind === 'check' || kind === 'stub' ? [] : (options.snippets ?? [id]),
      kind,
      timeout: options.timeout ?? 30_000,
      proves: options.proves,
      fn,
      order: this.steps.size,
    };
    this.steps.set(id, def);
    return def;
  }

  get(id: string): StepDef | undefined {
    return this.steps.get(id);
  }

  /** Stable sort by phase, then registration order. This is the order Mocha runs the steps in. */
  ordered(): StepDef[] {
    return [...this.steps.values()].sort(
      (a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase) || a.order - b.order,
    );
  }

  /**
   * Selects steps by a predicate and adds, transitively, every step a selected step `needs`. Those run on demand as
   * prerequisites with their own role's keys. With no predicate every step is selected.
   */
  select(predicate?: (step: StepDef) => boolean): Selection {
    const ordered = this.ordered();
    const chosen = new Set(ordered.filter((s) => !predicate || predicate(s)).map((s) => s.id));
    const needed = new Set<string>();
    const visit = (id: string): void => {
      for (const need of this.steps.get(id)?.needs ?? []) {
        if (chosen.has(need) || needed.has(need)) continue;
        needed.add(need);
        visit(need);
      }
    };
    for (const id of chosen) visit(id);
    const run = new Set(ordered.filter((s) => chosen.has(s.id) || needed.has(s.id)).map((s) => s.id));
    const notSelected = new Set(ordered.filter((s) => !run.has(s.id)).map((s) => s.id));
    return { run, prerequisites: needed, notSelected };
  }

  /** Every `needs` edge whose two ends run as different roles. */
  crossRoleNeeds(): Array<{ step: string; role: Role; needs: string; needsRole: Role }> {
    const out: Array<{ step: string; role: Role; needs: string; needsRole: Role }> = [];
    for (const step of this.ordered()) {
      for (const need of step.needs) {
        const target = this.steps.get(need);
        if (target && target.keyset !== step.keyset) out.push({ step: step.id, role: step.keyset, needs: need, needsRole: target.keyset });
      }
    }
    return out;
  }

  /** Wiring problems: unknown needs, needs that run later, cycles. Empty means the plan is sound. */
  validate(): string[] {
    const problems: string[] = [];
    const order = this.ordered();
    const position = new Map(order.map((s, i) => [s.id, i]));
    for (const step of order) {
      for (const need of step.needs) {
        const target = this.steps.get(need);
        if (!target) {
          problems.push(`${step.id}: needs unknown step "${need}"`);
        } else if (target.id === step.id) {
          problems.push(`${step.id}: needs itself`);
        } else if (position.get(need)! > position.get(step.id)!) {
          problems.push(`${step.id} (${step.phase}) needs "${need}" (${target.phase}) which runs later`);
        }
      }
      if (step.kind === 'step' && step.snippets.length === 0) problems.push(`${step.id}: step has no snippet ids`);
    }
    return problems;
  }

  /** Why a step cannot run right now, or undefined when it can. Pure with respect to recorded results. */
  skipReason(step: StepDef): string | undefined {
    // Precedence: a declared skip wins, then missing keys, then an upstream step that did not pass.
    if (step.skipIf) return step.skipIf;
    if (!this.availability[step.keyset]) return `missing-env:${step.keyset}`;
    for (const need of step.needs) {
      const result = this.results.get(need);
      if (!result || result.status !== 'passed') return `blocked-by:${need}`;
    }
    return undefined;
  }

  /** Called by the Mocha binding after each step. `needs` of later steps read these results. */
  record(id: string, result: StepResult): void {
    this.results.set(id, result);
  }

  result(id: string): StepResult | undefined {
    return this.results.get(id);
  }

  allResults(): Array<{ step: StepDef; result: StepResult }> {
    return this.ordered().map((step) => ({ step, result: this.results.get(step.id) ?? { status: 'pending' } }));
  }

  /**
   * Runs the same skip logic the Mocha binding uses, with fake bodies. `failing` lists step ids that fail.
   * Used by the dry run to prove skip-on-upstream-failure without a network.
   */
  simulate(failing: string[]): Array<{ id: string; status: StepStatus; reason?: string }> {
    const saved = new Map(this.results);
    this.results.clear();
    const out: Array<{ id: string; status: StepStatus; reason?: string }> = [];
    for (const step of this.ordered()) {
      const reason = this.skipReason(step);
      if (reason) {
        this.results.set(step.id, { status: 'skipped', reason });
        out.push({ id: step.id, status: 'skipped', reason });
      } else if (failing.includes(step.id)) {
        this.results.set(step.id, { status: 'failed' });
        out.push({ id: step.id, status: 'failed' });
      } else {
        this.results.set(step.id, { status: 'passed' });
        out.push({ id: step.id, status: 'passed' });
      }
    }
    this.results = saved;
    return out;
  }
}

export const registry = new Registry();

/** The Mocha title of a step. It carries the snippet ids, so `--grep <id>` finds the step. */
export function stepTitle(def: StepDef): string {
  const ids = def.snippets.length > 0 ? ` [${def.snippets.join(', ')}]` : '';
  return `${def.phase} ${def.page} :: ${def.id}${ids}`;
}

export interface SelectionFilters {
  shard?: Role;
  grep?: string;
  only?: string[];
}

/** The selection of a run, shared by the CLI (to decide setup work) and the Mocha binding (to create tests). */
export function selectSteps(reg: Registry, filters: SelectionFilters): Selection {
  const grep = filters.grep ? new RegExp(filters.grep) : undefined;
  const filtered = Boolean(grep || filters.only || filters.shard);
  return reg.select(
    filtered
      ? (def) =>
          (!filters.shard || def.keyset === filters.shard) &&
          (!grep || grep.test(stepTitle(def))) &&
          (!filters.only || filters.only.includes(def.id))
      : undefined,
  );
}

/** Roles that run (selected steps and their prerequisites). `open` always counts: every role uses the open cast. */
export function rolesOf(reg: Registry, selection: Selection): Set<Role> {
  const roles = new Set<Role>(reg.ordered().filter((d) => selection.run.has(d.id)).map((d) => d.keyset));
  roles.add('open');
  return roles;
}
