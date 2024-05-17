import { join, basename, dirname } from 'path';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const gzipPlugin = require('rollup-plugin-gzip').default;
import terser from '@rollup/plugin-terser';

import { browser, version } from './package.json';

const enableTreeShaking = true;
const replaceConfiguration = {
  'process.env.CRYPTO_MODULE': JSON.stringify(process.env.CRYPTO_MODULE ?? 'enabled'),
  'process.env.SHARED_WORKER': JSON.stringify(process.env.SHARED_WORKER ?? 'enabled'),
  'process.env.PUBLISH_MODULE': JSON.stringify(process.env.PUBLISH_MODULE ?? 'enabled'),
  'process.env.SUBSCRIBE_MODULE': JSON.stringify(process.env.SUBSCRIBE_MODULE ?? 'enabled'),
  'process.env.PRESENCE_MODULE': JSON.stringify(process.env.PRESENCE_MODULE ?? 'enabled'),
  'process.env.PAM_MODULE': JSON.stringify(process.env.PAM_MODULE ?? 'enabled'),
  'process.env.CHANNEL_GROUPS_MODULE': JSON.stringify(process.env.CHANNEL_GROUPS_MODULE ?? 'enabled'),
  'process.env.MESSAGE_PERSISTENCE_MODULE': JSON.stringify(process.env.MESSAGE_PERSISTENCE_MODULE ?? 'enabled'),
  'process.env.MOBILE_PUSH_MODULE': JSON.stringify(process.env.MOBILE_PUSH_MODULE ?? 'enabled'),
  'process.env.APP_CONTEXT_MODULE': JSON.stringify(process.env.APP_CONTEXT_MODULE ?? 'enabled'),
  'process.env.FILE_SHARING_MODULE': JSON.stringify(process.env.FILE_SHARING_MODULE ?? 'enabled'),
  'process.env.MESSAGE_REACTIONS_MODULE': JSON.stringify(process.env.MESSAGE_REACTIONS_MODULE ?? 'enabled'),
  preventAssignment: true,
};

export default [
  {
    input: 'src/web/index.ts',
    output: {
      file: browser,
      format: 'umd',
      name: 'PubNub',
      sourcemap: true,
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: join(dirname(browser), basename(browser, '.min.js') + '.js'),
      format: 'umd',
      name: 'PubNub',
      sourcemap: true,
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: join(dirname(browser), basename(browser, '.min.js') + '.worker.min.js'),
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: join(dirname(browser), basename(browser, '.min.js') + '.worker.js'),
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript({ tsconfig: 'tsconfig.rollup.json' })],
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: `upload/gzip/pubnub.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
      gzipPlugin({ fileName: '' }),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: `upload/gzip/pubnub.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      gzipPlugin({ fileName: '' }),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: `upload/normal/pubnub.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: `upload/normal/pubnub.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace(replaceConfiguration),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
    ],
    treeshake: {
      moduleSideEffects: !enableTreeShaking,
    },
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: `upload/gzip/pubnub.worker.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
      gzipPlugin({ fileName: '' }),
    ],
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: `upload/gzip/pubnub.worker.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      gzipPlugin({ fileName: '' }),
    ],
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: `upload/normal/pubnub.worker.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
  },
  {
    input: 'src/transport/subscription-worker/subscription-worker.ts',
    output: {
      file: `upload/normal/pubnub.worker.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript({ tsconfig: 'tsconfig.rollup.json' })],
  },
];
