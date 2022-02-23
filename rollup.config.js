import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

import { terser } from 'rollup-plugin-terser';

import { browser } from './package.json';
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
      file: 'dist/web/pubnub.js',
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [json(), resolve({ browser: true }), commonjs(), typescript(tsConfig)],
  },
];
