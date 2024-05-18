const { MongoClient } = require('mongodb');
const config = require('config');
const MONGO_URI = config.get('MONGO_URI');

// @desc Add a "hello" document to the database
// @route POST /api/hello
// @access Public
const addHello = async (req, res) => {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 60000, // 60 seconds
    });

    const db = client.db();
    const collection = db.collection('hellos');

    const result = await collection.insertOne({ message: 'hello' });

    console.log('Document inserted:', result.insertedId);

    res.status(201).json({ message: 'Hello document added', _id: result.insertedId });

    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { addHello };