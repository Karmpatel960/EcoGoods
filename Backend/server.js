const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const config = require('config');
const connectDB = require('./config/db');
const expressListEndpoints = require('express-list-endpoints');
const helloRoutes = require('./routes/hello'); // Import the new routes


dotenv.config();

const PORT = process.env.PORT || config.get('PORT');
const CORS_ORIGIN = process.env.CORS_ORIGIN || config.get('CORS_ORIGIN');

// Create a logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

connectDB();

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message) }}));

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/hello', helloRoutes);

// Endpoint to list all routes
app.get('/api/endpoints', (req, res) => {
  res.json(expressListEndpoints(app));
});


app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
