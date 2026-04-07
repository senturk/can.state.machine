// src/can-state-machine.mjs
// ESM entry point for the can-state-machine npm package.
// We import the CJS source via a dynamic workaround and re-export the class
// as a named + default export so consumers can use either:
//   import CanStateMachine from 'can-state-machine'
//   import { CanStateMachine } from 'can-state-machine'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const CanStateMachine = require('../src/can-state-machine.js');

export { CanStateMachine };
export default CanStateMachine;