'use strict';
const path = require('path');

const SRC = './src/can-state-machine.js';

/** @type {import('webpack').Configuration[]} */
module.exports = [

  // ── 1. CJS für Node ──────────────────────────────────────────────
  {
    name: 'cjs',
    entry: SRC,
    mode: 'production',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.cjs',
      library: {
        type: 'commonjs2',
        export: 'default',   // unwrap default → require('can-state-machine') gibt die Klasse direkt
      },
    },
    optimization: { minimize: false, mangleExports: false },
  },

  // ── 2. ESM für Node + moderne Bundler ────────────────────────────
  {
    name: 'esm',
    entry: SRC,
    mode: 'production',
    target: 'es2020',
    experiments: { outputModule: true },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.mjs',
      module: true,
      chunkFormat: 'module',
      library: { type: 'module' },
      environment: { module: true },
    },
    optimization: {
      minimize: false,
      mangleExports: false,
      concatenateModules: true,
    },
  },

  // ── 3. UMD für klassischen <script>-Tag ──────────────────────────
  {
    name: 'browser-umd',
    entry: SRC,
    mode: 'production',
    target: ['web', 'es5'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'can-state-machine.min.js',
      library: {
        name: 'CanStateMachine',
        type: 'umd',
        export: 'default',   // window.CanStateMachine ist die Klasse, nicht {default: Klasse}
      },
      globalObject: 'this',
    },
  },

  // ── 4. Browser-ESM standalone (für unpkg via <script type="module">) ──
  {
    name: 'browser-esm',
    entry: SRC,
    mode: 'production',
    target: 'web',
    experiments: { outputModule: true },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'can-state-machine.esm.js',
      module: true,
      chunkFormat: 'module',
      library: { type: 'module' },
      environment: { module: true },
    },
    optimization: {
      minimize: true,
      mangleExports: false,
      concatenateModules: true,
    },
  },
];