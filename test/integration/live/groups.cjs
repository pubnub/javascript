// API groups of the live tier. DATA ONLY. One group is one job of the "Live tests" workflow (.github/workflows/live-integration.yml)
// and one `LIVE_GROUP=<name>` run of the npm scripts:
//
//   LIVE_GROUP=publish npm run test:integration:live                    a docs-tier group (tier 'docs')
//   LIVE_GROUP=endpoints-datasync npm run test:integration:live:endpoints   an endpoint-tier group (tier 'endpoints')
//
// .mocharc.cjs and .mocharc.endpoints.cjs read this file and replace their `spec` with the group's files. support/hooks.ts reads
// `roles`: a group run without --grep needs exactly these keyset roles up front, and the preflight and the secured-keyset wait
// cover only these roles. The workflow builds its job matrix from this list (support/groups.ts --matrix).
//
// Every *.test.ts file of the tier belongs to exactly one group. `npm run test:integration:live:lint` runs
// `support/groups.ts --check`, which fails on a test file in no group or in two groups, a listed file that does not exist, a file in
// the wrong tier, a role that a file uses but its group does not list, and a workflow `group` input whose options differ from these
// names. Add a new test file to a group here, or the lint fails.
//
// Paths are relative to test/integration/live/. Order is the order of the serial run in CI.
module.exports = [
  // Stable groups are merged to keep the job count low. The groups that failed most often in CI history (datasync, endpoints-datasync,
  // app-context, endpoints-history) stay alone, so one re-run does not repeat stable tests. access-manager is alone too: it needs
  // the DataSync role of the docs keyset, which the flaky groups share.
  {
    name: 'messaging',
    tier: 'docs',
    roles: ['open', 'pam'],
    files: [
      'api-reference/publish.test.ts',
      'api-reference/publish-legacy.test.ts',
      'api-reference/subscribe.test.ts',
      'api-reference/subscribe-legacy.test.ts',
      'api-reference/presence.test.ts',
      'api-reference/channel-groups.test.ts',
      'api-reference/file-sharing.test.ts',
      'api-reference/file-sharing-legacy.test.ts',
      'api-reference/mobile-push.test.ts',
      'api-reference/message-persistence.test.ts',
      'api-reference/message-persistence-legacy.test.ts',
      'api-reference/message-actions.test.ts',
    ],
  },
  {
    name: 'getting-started',
    tier: 'docs',
    roles: ['open', 'pam'],
    files: [
      'getting-started/logging.test.ts',
      'getting-started/logging-file-logger.test.ts',
      'getting-started/quickstart-node.test.ts',
      'getting-started/set-up-your-environment.test.ts',
      'getting-started/status-events.test.ts',
      'getting-started/troubleshooting.test.ts',
      'shared/import-pubnub.test.ts',
      'api-reference/configuration.test.ts',
      'api-reference/configuration-legacy.test.ts',
      'api-reference/encryption.test.ts',
      'api-reference/encryption-legacy.test.ts',
      'api-reference/misc.test.ts',
      'migration-guides/v8.test.ts',
      'migration-guides/v11.test.ts',
      'migration-guides/v12.test.ts',
    ],
  },
  {
    name: 'use-cases',
    tier: 'docs',
    roles: ['open', 'pam'],
    files: [
      'use-cases/automated-polling.test.ts',
      'use-cases/fan-behavior-management.test.ts',
      'use-cases/fan-re-engagement.test.ts',
      'use-cases/game-chat-moderation.test.ts',
      'use-cases/live-commentary.test.ts',
      'use-cases/live-event-rate-limiting.test.ts',
      'use-cases/live-polls.test.ts',
      'use-cases/match-stats.test.ts',
      'use-cases/real-time-ads.test.ts',
      'use-cases/real-time-chat.test.ts',
      'use-cases/score-alerts.test.ts',
    ],
  },
  {
    name: 'access-manager',
    tier: 'docs',
    roles: ['open', 'pam', 'datasync'],
    files: ['api-reference/access-manager.test.ts', 'api-reference/access-manager-legacy.test.ts'],
  },
  {
    name: 'app-context',
    tier: 'docs',
    roles: ['open', 'pam'],
    files: ['api-reference/objects.test.ts'],
  },
  {
    name: 'datasync',
    tier: 'docs',
    roles: ['open', 'datasync'],
    files: ['api-reference/datasync.test.ts'],
  },
  {
    name: 'endpoints-datasync',
    tier: 'endpoints',
    roles: ['datasync'],
    files: [
      'endpoints/data_sync/events.channel.test.ts',
      'endpoints/data_sync/events.entity.test.ts',
      'endpoints/data_sync/events.membership.test.ts',
      'endpoints/data_sync/events.relationship.test.ts',
      'endpoints/data_sync/events.user.test.ts',
      'endpoints/data_sync/projections.test.ts',
    ],
  },
  {
    name: 'endpoints-history',
    tier: 'endpoints',
    roles: ['open'],
    files: ['endpoints/fetch_messages.test.ts', 'endpoints/history.test.ts', 'endpoints/message_actions.test.ts'],
  },
];
