'use strict';
const path = require('path');

/** @type {import('webpack').Configuration[]} */
module.exports = [

  // --- CommonJS build ---
  {
    entry: './src/can-state-machine.js',
    mode: 'production',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.cjs',
      library: {
        type: 'commonjs2',
        export: 'default',   // <-- neu: unwrap den ESM-default-Export
      },
    },
    optimization: { minimize: false },
  },

  // --- ESM build ---
  {
    name: 'esm',
    entry: './src/can-state-machine.js',
    mode: 'production',
    target: 'es2020',                    // <-- 'es2020' statt 'web'
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.mjs',
      module: true,                      // <-- neu
      chunkFormat: 'module',             // <-- neu
      library: {
        type: 'module',
      },
      environment: { module: true },     // <-- neu: sagt Webpack, dass der Consumer Module kann
    },
    optimization: { minimize: false, mangleExports: false, concatenateModules: true },  // <-- concatenateModules flacht die Runtime aus
  },
];