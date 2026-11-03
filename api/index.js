/**
 * Vercel serverless entry: the same Express app the local server runs,
 * with the MongoDB connection reused across warm invocations.
 * Socket.IO is not available here — the client falls back to polling.
 */
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';

const app = createApp();

export default async function handler(req, res) {
  await connectDb();
  return app(req, res);
}
