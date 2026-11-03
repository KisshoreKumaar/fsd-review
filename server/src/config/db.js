import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let memoryServer = null;

/**
 * Resolves a connection string. With no MONGO_URI configured we spin up an
 * in-process MongoDB so the app is runnable without Docker or Atlas (dev only).
 */
const resolveUri = async () => {
  if (env.mongoUri) return env.mongoUri;
  if (env.isProd) throw new Error('MONGO_URI is required in production');

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create({ instance: { dbName: 'college_admission' } });
  logger.warn('MONGO_URI not set — started in-process MongoDB (data is ephemeral)');
  return memoryServer.getUri();
};

let connecting = null;

/** Safe to call on every request: reuses the open connection (serverless-friendly). */
export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;
  connecting = open().finally(() => {
    connecting = null;
  });
  return connecting;
};

const open = async () => {
  mongoose.set('strictQuery', true);
  const uri = await resolveUri();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    dbName: process.env.MONGO_DB_NAME || 'college_admission',
  });
  logger.info(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export default connectDb;
