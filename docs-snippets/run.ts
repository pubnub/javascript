/**
 * The plan: the one place that lists every page module of the suite.
 *
 * Role. `harness/mocha-entry.ts` imports this file from the staged copy (`docs-snippets/.run/<runId>/run.ts`), calls
 * `registerAll(world)` and turns each registered step into one Mocha test. A page module is a file that default
 * exports `page(path, phase, setup)` (see `harness/step.ts`). It only registers steps when `setup(world)` runs, so
 * importing the modules here has no side effects.
 *
 * Order. Steps sort by phase first (P0 to P9), then by the position of their page module in `plan` below, then by
 * registration order inside the page. So this list decides the order inside one phase only. The phases are: P0 boot, P1 secure (Access Manager), P2 catalog (DataSync), P3 rooms (App Context, channel
 * groups), P4 live (subscribe, publish, presence, files), P5 history, P6 push, P7 network (proxy, outage), P8 legacy,
 * P9 teardown. Each page module sets its own default phase and a step may override it.
 *
 * Adding a page. Create `api-reference/<name>.ts` (same base name as the docs page), import it here and add it to
 * `plan`. `npm run test:docs-snippets:dry` then checks that every snippet the lint finds is claimed by exactly one step.
 */
import { registry } from './harness/registry.js';
import type { PageModule } from './harness/step.js';
import type { World } from './harness/world.js';
import preflight from './harness/preflight.js';
import preflightSummary from './harness/preflight-summary.js';
import shared from './shared/import-pubnub.js';
import configuration from './api-reference/configuration.js';
import channelGroups from './api-reference/channel-groups.js';
import publish from './api-reference/publish.js';
import subscribe from './api-reference/subscribe.js';
import presence from './api-reference/presence.js';
import messageActions from './api-reference/message-actions.js';
import messagePersistence from './api-reference/message-persistence.js';
import misc from './api-reference/misc.js';
import accessManager from './api-reference/access-manager.js';
import accessManagerV2 from './api-reference/access-manager-v2.js';
import accessManagerLegacy from './api-reference/access-manager-legacy.js';
import encryption from './api-reference/encryption.js';
import encryptionLegacy from './api-reference/encryption-legacy.js';
import objects from './api-reference/objects.js';
import datasync from './api-reference/datasync.js';
import fileSharing from './api-reference/file-sharing.js';
import fileSharingLegacy from './api-reference/file-sharing-legacy.js';
import mobilePush from './api-reference/mobile-push.js';
import subscribeLegacy from './api-reference/subscribe-legacy.js';
import publishLegacy from './api-reference/publish-legacy.js';
import messagePersistenceLegacy from './api-reference/message-persistence-legacy.js';
import configurationLegacy from './api-reference/configuration-legacy.js';
import quickstartNode from './getting-started/quickstart-node.js';
import setUpYourEnvironment from './getting-started/set-up-your-environment.js';
import logging from './getting-started/logging.js';
import loggingFileLogger from './getting-started/logging-file-logger.js';
import statusEvents from './getting-started/status-events.js';
import troubleshooting from './getting-started/troubleshooting.js';
import migrationV8 from './migration-guides/v8.js';
import migrationV11 from './migration-guides/v11.js';
import migrationV12 from './migration-guides/v12.js';

/**
 * Page modules. Steps carry their own phase, so the order here only decides registration order inside a
 * phase. The runner sorts by phase (P0 to P9), then by this order.
 *
 * Dependencies that must hold are written as `needs` on the step, which the registry validates (a need that runs
 * later is a wiring error), so the order here is only a tie-breaker inside a phase.
 */
export const plan: PageModule[] = [
  preflight,
  shared,
  configuration,
  channelGroups,
  publish,
  subscribe,
  presence,
  messageActions,
  messagePersistence,
  misc,
  mobilePush,
  fileSharingLegacy,
  fileSharing,
  objects,
  datasync,
  accessManager,
  accessManagerV2,
  accessManagerLegacy,
  encryption,
  encryptionLegacy,
  // Legacy pages (P8).
  subscribeLegacy,
  publishLegacy,
  messagePersistenceLegacy,
  configurationLegacy,
  // Getting started, logging, status events, troubleshooting, migration guides.
  quickstartNode,
  setUpYourEnvironment,
  logging,
  loggingFileLogger,
  statusEvents,
  troubleshooting,
  migrationV8,
  migrationV11,
  migrationV12,
  // Last, so its P0 checks run after every other P0 preflight and can name every missing feature at once.
  preflightSummary,
];

/** Runs every page module's `setup`, which registers its steps in the global registry. Call `registry.reset()` first. */
export function registerAll(world: World): void {
  for (const module of plan) module.setup(world);
}

export { registry };
