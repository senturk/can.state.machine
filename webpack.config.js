const path = require('path');

module.exports = {
  entry: './src/can-state-machine.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'can-state-machine.min.js',
    library: {
        name: 'Can State Machine',
        type: 'umd',
      },
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  target: ['web', 'es5'],
  externals: {
  }
};