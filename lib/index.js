const { CanStateMachine } = require('../src/can-state-machine');

module.exports = {
  CanStateMachine,
  createCSM: (config) => new CanStateMachine(config)
};