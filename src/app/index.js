const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

/**
 * Returns a promise to setup the server, and resolves
 * when the server has been set up.
 */
const setup = () => new Promise((resolve, reject) => {
  app.use(cors());
  app.use(bodyParser.json());
  const server = app.listen(process.env.PORT, () => {
    module.exports.io = require('socket.io').listen(server);
    console.log('Server setup, listening to port:', process.env.PORT);
    resolve();
  });
});

const start = () => {
  require('./core-mqtt');
  require('./core-api');
  require('./spotify-api');
  require('./beacon-presence-api');
}

module.exports = {
  setup,
  start,
  app,
  io: null
}
