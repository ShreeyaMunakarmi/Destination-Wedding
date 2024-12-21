import app from './app.js';
import connectDB from './config/database.js';
import winston from './utils/logger.js'; // Winston for logging
import dotenv from 'dotenv';

dotenv.config();

// Load environment variables
const PORT = process.env.PORT || 3000;

// Database Connection
(async () => {
  try {
    await connectDB();
    winston.info('Database connected successfully.');
  } catch (error) {
    winston.error(`Database connection failed: ${error.message}`);
    process.exit(1); // Exit with failure
  }
})();

// Start the Server
app.listen(PORT, () => {
  winston.info(`Server started on port ${PORT}`);
});
