import { join, basename, dirname, resolve as pathResolve } from 'path';
import ts from 'typescript';
import fs from 'fs';

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

import terser from '@rollup/plugin-terser';
const gzipPlugin = require('rollup-plugin-gzip').default;

import { browser, version } from './package.json';
import tsConfig from './tsconfig.rollup.json';

const sourcePath = pathResolve('src/transport/web-worker.ts');
const workerContent = fs.readFileSync(sourcePath, 'utf8');
const result = ts.transpileModule(workerContent, tsConfig);
const webWorkerDataUrl = `'data:application/javascript;base64,${btoa(result.outputText)}'`;

export default [
  {
    input: 'src/web/index.ts',
    output: {
      file: browser,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig), terser()],
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
      // Stringify Web Worker to register it from the Data URL.
      replace({
        WEB_WORKER_PLACEHOLDER: webWorkerDataUrl,
        preventAssignment: true,
      }),
      commonjs(),
      typescript(tsConfig),
    ],
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
      // Stringify Web Worker to register it from the Data URL.
      replace({
        WEB_WORKER_PLACEHOLDER: webWorkerDataUrl,
        preventAssignment: true,
      }),
      commonjs(),
      typescript(tsConfig),
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
      // Stringify Web Worker to register it from the Data URL.
      replace({
        WEB_WORKER_PLACEHOLDER: webWorkerDataUrl,
        preventAssignment: true,
      }),
      commonjs(),
      typescript(tsConfig),
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
      // Stringify Web Worker to register it from the Data URL.
      replace({
        WEB_WORKER_PLACEHOLDER: webWorkerDataUrl,
        preventAssignment: true,
      }),
      commonjs(),
      typescript(tsConfig),
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
      // Stringify Web Worker to register it from the Data URL.
      replace({
        WEB_WORKER_PLACEHOLDER: webWorkerDataUrl,
        preventAssignment: true,
      }),
      commonjs(),
      typescript(tsConfig),
    ],
  },
];
