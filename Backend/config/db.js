const { MongoClient } = require('mongodb');
const config = require('config');

const MONGO_URI = config.get('MONGO_URI');

const client = new MongoClient(MONGO_URI, {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  socketTimeoutMS: 60000, // 60 seconds
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
};

module.exports = connectDB;

