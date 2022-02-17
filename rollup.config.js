import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/web/index.js',
    output: {
      file: 'dist/web/pubnub.js',
      format: 'umd',
      name: 'PubNub',
    },
    plugins: [
      json(),
      resolve({ browser: true }),
      commonjs(),
      typescript(),
      terser(),
    ],
  },
  {
    input: 'src/node/index.js',
    output: {
      file: 'dist/node/pubnub.js',
      format: 'cjs',
      exports: 'default',
    },
    plugins: [resolve(), typescript(), terser()],
    external: [
      'agentkeepalive',
      'buffer',
      'cbor-js',
      'cbor-sync',
      'lil-uuid',
      'superagent',
      'superagent-proxy',
    ],
  },
];
