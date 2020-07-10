/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const mongoose = require('mongoose');

const mpaging = require('../index.js');

const db = mongoose.createConnection('mongodb://localhost/test_collection_of_mongo_fg');
const schema = new mongoose.Schema({ name: String });
schema.plugin(mpaging);

const dropCollection = async () => {
  await db.dropDatabase();
};
const model = db.model('testModel', schema);

const insetDoc = async () => {
  const insertDoc = Array(100).fill({ name: 'fg' });
  for (let i = 0; i <= 100; i++) {
    await model.create(insertDoc[i]);
  }
};
module.exports = {
  model, dropCollection, insetDoc,
};
