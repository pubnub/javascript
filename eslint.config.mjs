// ESLint flat config. `npm run lint` lints src/ only; `test:integration:live:lint` lints the live tier (block below).
// Other tests are formatted by prettier.
// Existing violations of the stricter rules are baselined in eslint-suppressions.json (see AGENTS.md).
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';

// Converting a timetoken to a number loses precision: timetokens exceed 2^53.
const timetokenToNumber = 'Timetokens are strings (they exceed 2^53). Use string or BigInt arithmetic instead.';
const timetoken = '/timetoken/i';

// Sources excluded from tsconfig.json (keep in sync with its `exclude`). The project service only reads tsconfig.json,
// so these get the non-type-aware rules; build:web type-checks the web and worker ones.
const outsideTsconfig = [
  'src/crypto/modules/WebCryptoModule/**',
  'src/crypto/modules/web.ts',
  'src/file/modules/web.ts',
  'src/transport/subscription-worker/**',
  'src/transport/titanium-transport.ts',
  'src/transport/web-transport.ts',
  'src/web/**',
];

export default tseslint.config(
  {
    // No build config compiles src/nativescript or src/titanium (see AGENTS.md).
    ignores: [
      'coverage/',
      'dist/',
      'karma/',
      'lib/',
      'node_modules/',
      'test/dist/',
      'upload/',
      'src/nativescript/',
      'src/titanium/',
    ],
  },
  {
    // Keep intent-marking directives (bitwise hashing, console warnings); --fix would otherwise delete them.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  {
    files: ['src/**/*.{ts,js}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    plugins: { prettier, sonarjs },
    languageOptions: {
      // `projectService`, not `project`: with `project`, the re-lint after `--fix` loses type information and reports
      // hundreds of false errors.
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      'prettier/prettier': 'error',
      'max-len': ['error', { code: 120, tabWidth: 2 }],
      'no-prototype-builtins': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Correctness. `no-unnecessary-condition` and `prefer-nullish-coalescing` are deliberately not enabled: their
      // fixes change null/undefined handling, which plain-JS callers rely on.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',

      // Maintainability.
      'sonarjs/cognitive-complexity': ['error', 25],
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-collapsible-if': 'error',
      'sonarjs/no-redundant-jump': 'error',

      'no-restricted-syntax': [
        'error',
        ...['Identifier', 'MemberExpression'].flatMap((arg) => [
          {
            selector: `CallExpression[callee.name=/^(Number|parseInt|parseFloat)$/] > ${arg}[${arg === 'Identifier' ? 'name' : 'property.name'}=${timetoken}]`,
            message: timetokenToNumber,
          },
          {
            selector: `UnaryExpression[operator='+'] > ${arg}[${arg === 'Identifier' ? 'name' : 'property.name'}=${timetoken}]`,
            message: timetokenToNumber,
          },
        ]),
      ],
    },
  },
  {
    files: outsideTsconfig,
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // Shared code must run on every platform (see AGENTS.md).
    files: ['src/core/**/*.ts', 'src/entities/**/*.ts', 'src/event-engine/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage'].map((name) => ({
          name,
          message: 'Platform-specific global; shared code must not depend on browser APIs.',
        })),
      ],
    },
  },
  {
    // Live integration tier, linted by `npm run test:integration:live:lint` (quickstarts/ excluded there). Long comments,
    // test titles and sample strings may exceed 120 columns; the sample lines between the markers are never reformatted.
    files: ['test/integration/live/**/*.ts'],
    extends: [tseslint.configs.recommended],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      'max-len': [
        'error',
        { code: 120, tabWidth: 2, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true },
      ],
      'no-prototype-builtins': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
);
