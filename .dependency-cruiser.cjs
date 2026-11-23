// Architecture rules for src/ (`npm run lint:arch`). Cycles count only through imports that survive compilation;
// type-only cycles do not affect CommonJS load order.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'shared-no-node-builtins',
      comment: 'src/core, src/entities and src/event-engine run on every platform; Node built-ins belong in src/node.',
      severity: 'error',
      from: { path: '^src/(core|entities|event-engine)/' },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'shared-no-platform-code',
      comment: 'Shared code must not import a platform entry point or transport; inject them from the entry point.',
      severity: 'error',
      from: { path: '^src/(core|entities|event-engine)/' },
      to: {
        path: [
          '^src/(node|web|react_native|nativescript|titanium)/',
          '^src/transport/(node|web|react-native|titanium)-transport\\.ts$',
          '^src/transport/subscription-worker/',
        ],
      },
    },
    {
      name: 'no-circular',
      comment: 'Runtime import cycles break CommonJS load order (undefined imports at module evaluation).',
      severity: 'error',
      from: {},
      to: { circular: true, viaOnly: { dependencyTypesNot: ['type-only', 'pre-compilation-only'] } },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: 'specify',
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
