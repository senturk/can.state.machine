// webpack.config.js
'use strict';

const path = require('path');

/** @type {import('webpack').Configuration[]} */
module.exports = [

  // --- CommonJS build (Node.js require / legacy bundlers) ---
  {
    entry: './src/can-state-machine.js',
    mode: 'production',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.cjs',           // explicit .cjs extension = unambiguous
      library: {
        type: 'commonjs2',
      },
    },
    optimization: { minimize: false }, // keep readable for a library
  },

  // --- ESM build (bundlers, native Node ESM, Vite, etc.) ---
  {
    entry: './src/can-state-machine.js',
    mode: 'production',
    target: 'web',                     // also works in Node 12+ ESM consumers
    experiments: {
      outputModule: true,              // webpack 5 ESM output
    },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'index.mjs',
      library: {
        type: 'module',
      },
    },
    optimization: { minimize: false },
  },

];