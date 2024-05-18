const { MongoClient, ObjectId } = require('mongodb');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGO_URI = config.get('MONGO_URI');

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });

    const db = client.db();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const userExists = await usersCollection.findOne({ email });
    if (userExists) {
      client.close();
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await usersCollection.insertOne({ name, email, password: hashedPassword });
    const user = result.ops[0];

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }

    client.close();
  } catch (error) {
    if (error.message.includes('Operation `users.insertOne()` buffering timed out')) {
      setTimeout(async () => {
        try {
          const client = await MongoClient.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 60000,
            socketTimeoutMS: 60000,
          });

          const db = client.db();
          const usersCollection = db.collection('users');

          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const result = await usersCollection.insertOne({ name, email, password: hashedPassword });
          const user = result.ops[0];

          if (user) {
            res.status(201).json({
              _id: user._id,
              name: user.name,
              email: user.email,
              token: generateToken(user._id),
            });
          } else {
            res.status(400).json({ message: 'Invalid user data' });
          }

          client.close();
        } catch (error) {
          res.status(500).json({ message: 'Internal Server Error' });
        }
      }, 2000); // Retry after 2 seconds
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });

    const db = client.db();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }

    client.close();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerUser,
  authUser,
};