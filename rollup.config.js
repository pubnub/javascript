import { join, basename, dirname } from 'path';

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

import { terser } from 'rollup-plugin-terser';
import gzipPlugin from 'rollup-plugin-gzip';

import { browser, version } from './package.json';
import tsConfig from './tsconfig.rollup.json';

export default [
  {
    input: 'src/web/index.js',
    output: {
      file: browser,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig), terser()],
  },
  {
    input: 'src/web/index.js',
    output: {
      file: join(dirname(browser), basename(browser, '.min.js') + '.js'),
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig)],
  },
  {
    input: 'src/web/index.js',
    output: {
      file: `upload/gzip/pubnub.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript(tsConfig),
      terser(),
      gzipPlugin({ fileName: '' }),
    ],
  },
  {
    input: 'src/web/index.js',
    output: {
      file: `upload/gzip/pubnub.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig), gzipPlugin({ fileName: '' })],
  },
  {
    input: 'src/web/index.js',
    output: {
      file: `upload/normal/pubnub.${version}.min.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig), terser()],
  },
  {
    input: 'src/web/index.js',
    output: {
      file: `upload/normal/pubnub.${version}.js`,
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig)],
  },
];
