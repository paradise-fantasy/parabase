const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const server = app.listen(process.env.PORT, () => console.log('App is ready!'));
const io = require('socket.io').listen(server);

const parseQuery = (rawQuery) => {
  const query = {
    limit: 100,
    sort: null
  };

  if (typeof rawQuery.limit !== "undefined") {
    query.limit = parseInt(rawQuery.limit) < 0 ? null : parseInt(rawQuery.limit); // limit is null if negative limit specified
  }

  if (typeof rawQuery.sort !== "undefined") {
    query.sort = [];
    const sortings = Array.isArray(rawQuery.sort) ? rawQuery.sort.slice(0) : [rawQuery.sort];
    sortings.forEach(sorting => {
      const order = sorting.startsWith('-') ? -1 : 1;
      const collection = order === -1 ? sorting.substr(1) : sorting;
      query.sort.push([collection, order]);
    });
    console.log(query.sort);
  }

  return query;
}

module.exports = config => {
  const { db, mqtt } = config;

  mqtt.subscribe('paradise/#');
  mqtt.on('message', (topic, payload) => {
    console.log('Message', topic, payload.toString());
    let data;

    if (topic.startsWith('paradise/log')) {
      try { data = JSON.parse(payload.toString()); }
      catch (err) { data = {}; }
      if (typeof data !== 'object') data = {};
      data._arrivedAt = new Date();
      data._service = topic.substring('paradise/log/'.length);
      data._value = payload.toString();
      db.collection('log').insert(data).catch(err => console.error(err));
      console.log('Emitting log data', data);
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
  });
}
