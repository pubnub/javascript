import { join, basename, dirname } from 'path';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const gzipPlugin = require('rollup-plugin-gzip').default;
import terser from '@rollup/plugin-terser';

import { browser, version } from './package.json';

const SERVICE_WORKER_CDN = 'https://cdn.pubnub.com/sdk/javascript';

export default [
  {
    input: 'src/web/index.ts',
    output: {
      file: browser,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: join(dirname(browser), basename(browser, '.min.js') + '.worker.min.js'),
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
  },
  {
    input: 'src/web/index.ts',
    output: {
      file: join(dirname(browser), basename(browser, '.min.js') + '.js'),
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: join(dirname(browser), basename(browser, '.min.js') + '.worker.js'),
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
    ],
  },
  {
    input: 'src/transport/service-worker/subscription-service-worker.ts',
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
    input: 'src/transport/service-worker/subscription-service-worker.ts',
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
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: `pubnub.worker.${version}.min.js`,
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
      gzipPlugin({ fileName: '' }),
    ],
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
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: `pubnub.worker.${version}.js`,
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      gzipPlugin({ fileName: '' }),
    ],
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
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: `pubnub.worker.${version}.min.js`,
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
      terser(),
    ],
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
      replace({
        SERVICE_WORKER_FILE_PLACEHOLDER: `pubnub.worker.${version}.js`,
        SERVICE_WORKER_CDN,
        preventAssignment: true,
      }),
      commonjs(),
      typescript({ tsconfig: 'tsconfig.rollup.json' }),
    ],
  },
  {
    input: 'src/transport/service-worker/subscription-service-worker.ts',
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
    input: 'src/transport/service-worker/subscription-service-worker.ts',
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
    input: 'src/transport/service-worker/subscription-service-worker.ts',
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
    input: 'src/transport/service-worker/subscription-service-worker.ts',
    output: {
      file: `upload/normal/pubnub.worker.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript({ tsconfig: 'tsconfig.rollup.json' })],
  },
];
