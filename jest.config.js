/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: {
        outDir: './test-js',
        allowJs: true,
        module: 'commonjs',
        esModuleInterop: true,
      },
    },
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]s$': 'ts-jest',
  },
  testRegex: '/test/.*\\.test\\.(js|ts)$',
  testPathIgnorePatterns: ['/dist/', '/coverage', '/node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testTimeout: 30000,
};
