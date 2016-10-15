const express = require('express');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/paradise-firebase';

const set = (key, value, _hasChild) => {
  const keyParts = key.split('/');
  const _key = keyParts.slice(0, -1).join('/');
  const _value = keyParts.slice(-1)[0];
  const _isChild = keyParts.length > 2;
  console.log(_key, _value, _hasChild);

  const collection = db.collection(_key);

  if (value === null) {
    return collection.deleteMany({ _key: _value });
  }

  return collection.findOne({ _key: _value })
  .then(doc => {
    const entry = {
      _key: _value,
      _value: value,
      _isChild,
      _hasChild: _hasChild ? _hasChild : false
    };
    if (doc) {
      return collection.updateOne({ _key: _value }, { $set: entry })
      .then(() => _isChild && set(_key, _value, true));
    } else {
      return collection.insertOne(entry)
      .then(() => _isChild && set(_key, null, true));
    }
  });
}

const get = (key) => {
  const [_key, _value] = key.split('/');
  const collection = db.collection(_key);

  return collection.findOne({ _key: _value })
  .then(doc => {
    if (doc === null) return null;
    switch (typeof doc) {
      case 'object':
        return doc._value;
      default:
        return doc;
    }
  });
}

const initialize = () => {
  // get('users/153').then(res => console.log(res));
  //set('users/123', false);
  //get('users/123').then(res => console.log(res))
  set('users/123/name', 'Raymi');
}

let db;
MongoClient.connect(url, (err, connection) => {
  if (err) return console.error(err);
  db = connection;
  initialize();
});
