// models/Hello.js
const mongoose = require('mongoose');

const helloSchema = new mongoose.Schema({
  message: { type: String, required: true },
});

const Hello = mongoose.model('Hello', helloSchema);

module.exports = Hello;