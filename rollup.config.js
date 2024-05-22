import { join, basename, dirname } from 'path';

import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const gzipPlugin = require('rollup-plugin-gzip').default;
import terser from '@rollup/plugin-terser';

import { browser, version } from './package.json';

const enableTreeShaking = false;
const replaceConfiguration = {
  /**
   * Module contains operations related to cryptors usage (including CBOR).
   *
   * Set `CRYPTO_MODULE` environment variable to `disabled` during build with Webpack or roll-up to
   * exclude module during tree-shaking optimization process.
   */
  'process.env.CRYPTO_MODULE': JSON.stringify(process.env.CRYPTO_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the browser background subscription requests handling.
   *
   * Set `SHARED_WORKER` environment variable to `disabled` during build with Webpack or roll-up to
   * exclude module during tree-shaking optimization process.
   */
  'process.env.SHARED_WORKER': JSON.stringify(process.env.SHARED_WORKER ?? 'enabled'),

  /**
   * Module contains functionality related to message and signals sending.
   *
   * Set `PUBLISH_MODULE` environment variable to `disabled` during build with Webpack or roll-up to
   * exclude module during tree-shaking optimization process.
   */
  'process.env.PUBLISH_MODULE': JSON.stringify(process.env.PUBLISH_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to subscription on real-time updates and their handling.
   *
   * Set `SUBSCRIBE_MODULE` environment variable to `disabled` during build with Webpack or roll-up
   * to exclude module during tree-shaking optimization process.
   */
  'process.env.SUBSCRIBE_MODULE': JSON.stringify(process.env.SUBSCRIBE_MODULE ?? 'enabled'),

  /**
   * Module contains functionality to support `SUBSCRIBE_MODULE` using event engine mechanism.
   *
   * **Important:** If there is no plans to use legacy subscription manager then it will be better
   * to disable `SUBSCRIBE_MANAGER_MODULE`.
   *
   * Set `SUBSCRIBE_EVENT_ENGINE_MODULE` environment variable to `disabled` during build with
   * Webpack or roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.SUBSCRIBE_EVENT_ENGINE_MODULE': JSON.stringify(process.env.SUBSCRIBE_EVENT_ENGINE_MODULE ?? 'enabled'),

  /**
   * Module contains functionality to support `SUBSCRIBE_MODULE` using event engine mechanism.
   *
   * **Important:** If there is no plans to use event engine then it will be better to disable
   * `SUBSCRIBE_EVENT_ENGINE_MODULE`.
   *
   * Set `SUBSCRIBE_MANAGER_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.SUBSCRIBE_MANAGER_MODULE': JSON.stringify(process.env.SUBSCRIBE_MANAGER_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the user presence and state management.
   *
   * Set `PRESENCE_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.PRESENCE_MODULE': JSON.stringify(process.env.PRESENCE_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the access token / auth key permissions management.
   *
   * **Important:** Module `disabled` by default for browser environment.
   */
  'process.env.PAM_MODULE': JSON.stringify(process.env.PAM_MODULE ?? 'disabled'),

  /**
   * Module contains functionality related to the channel group management.
   *
   * Set `CHANNEL_GROUPS_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.CHANNEL_GROUPS_MODULE': JSON.stringify(process.env.CHANNEL_GROUPS_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the message persistence (history storage) access and
   * management (remove messages).
   *
   * Set `MESSAGE_PERSISTENCE_MODULE` environment variable to `disabled` during build with Webpack
   * or roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.MESSAGE_PERSISTENCE_MODULE': JSON.stringify(process.env.MESSAGE_PERSISTENCE_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the mobile push notifications management for channels.
   *
   * Set `MOBILE_PUSH_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.MOBILE_PUSH_MODULE': JSON.stringify(process.env.MOBILE_PUSH_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the App Context entities and their relationship
   * management.
   *
   * Set `APP_CONTEXT_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.APP_CONTEXT_MODULE': JSON.stringify(process.env.APP_CONTEXT_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the file sharing.
   *
   * Set `FILE_SHARING_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
  'process.env.FILE_SHARING_MODULE': JSON.stringify(process.env.FILE_SHARING_MODULE ?? 'enabled'),

  /**
   * Module contains functionality related to the message reactions (message actions).
   *
   * Set `MESSAGE_REACTIONS_MODULE` environment variable to `disabled` during build with Webpack or
   * roll-up to exclude module during tree-shaking optimization process.
   */
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
