const mqtt = require('../mqtt').client.mqtt;
const db = require('../db').client.db;
const io = require('./index').io;
const isJSON = require('../msc/utils').isJSON;

const handleLogMessage = (service, payload) => {
  const data = {
    _arrivedAt: new Date(),
    _service: service,
    _value: payload
  };

  db.collection('log').insert(data).catch(err => console.error(err));
  io.emit('log', data);
};

const handleApiMessage = (service, payload) => {
  if (isJSON(payload)) payload = JSON.parse(payload);

  const data = {
    _arrivedAt: new Date(),
    _service: service,
    _value: payload
  };

  db.collection(service).insert(data).catch(err => console.error(err));
  io.emit(service, data);
};

const handleNotifyMessage = (service, payload) => {
  io.emit('notify', payload);
}

mqtt.subscribe('paradise/#');
mqtt.on('message', (topic, payload) => {
  const [ , messageType, service] = topic.split('/');

  switch (messageType) {
    case 'log': return handleLogMessage(service, payload.toString());
    case 'api': return handleApiMessage(service, payload.toString());
    case 'notify': return handleNotifyMessage(service, payload.toString());
  }
});
