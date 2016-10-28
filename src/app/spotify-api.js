const mqtt = require('../mqtt').client.mqtt;
const io = require('./index').io;

io.on('connection', client => {
  client.on('spotify', action => {
    mqtt.publish('paradise/notify/spotify', action);
  });
})
