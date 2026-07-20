import dotenv from 'dotenv';

dotenv.config();

export const config = {
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtSecret: process.env.JWT_SECRET || 'local-development-secret',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker_analytics',
  port: Number(process.env.SERVER_PORT || 5000),
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};

