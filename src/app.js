const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const parseQuery = (rawQuery) => {
  const query = {
    limit: 100,
    sort: null
  };

  if (typeof rawQuery.limit !== "undefined") {
    query.limit = rawQuery.limit < 0 ? null : rawQuery.limit; // limit is null if negative limit specified
  }

  return query;
}

module.exports = config => {
  const { db, mqtt } = config;

  mqtt.subscribe('paradise/#');
  mqtt.on('message', (topic, payload) => {
    let data;

    if (topic.startsWith('paradise/log')) {
      try { data = JSON.parse(payload.toString()); }
      catch (err) { data = {}; }
      data._arrivedAt = new Date();
      data._service = topic.substring('paradise/log/'.length);
      data._value = payload.toString();
      db.collection('log').insert(data).catch(err => console.error(err));
      io.emit('log', data);
    }

    if (topic.startsWith('paradise/api')) {
      try { data = JSON.parse(payload.toString()); }
      catch (err) { return console.error("Message not valid JSON: ", payload.toString()); }
      data._arrivedAt = new Date();
      const collection = topic.substring('paradise/api/'.length);
      db.collection(collection).insert(data).catch(err => console.error(err));
      io.emit(collection, data);
    }

    if (topic.startsWith('paradise/notify')) {
      io.emit('notify', payload.toString());
    }
  });

  const findDocuments = (collection, limit, sort) =>
    db.collection(collection).find().limit(limit).sort(sort).toArray();

  app.get('/api/:collection', (req, res) => {
    const collection = req.params.collection;
    const { limit, sort } = parseQuery(req.query);
    findDocuments(collection, limit, sort)
      .then(results => res.json(results))
      .catch(err => res.status(500).json(err));
  });

  app.get('/log', (req, res) => {
    const collection = 'log';
    const { limit, sort } = parseQuery(req.query);
    findDocuments(collection, limit, sort)
      .then(results => res.json(results))
      .catch(err => res.status(500).json(err));
  })

  app.listen(3000, () => console.log('App is ready!'));
}
