import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(here, '../..');
const repoRoot = path.resolve(serverRoot, '..');

// server/.env wins, repo-root .env is the fallback.
dotenv.config({ path: path.join(serverRoot, '.env') });
dotenv.config({ path: path.join(repoRoot, '.env') });

const num = (value, fallback) => (value ? Number(value) : fallback);

// Vercel exposes the deployment's own hostnames; allow them so preview and
// production URLs work without editing CLIENT_ORIGIN for each deployment.
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);
const isProd = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  isVercel: Boolean(process.env.VERCEL),
  // Show OTP / reset codes and temporary passwords on screen. Always on in
  // development; DEMO_MODE=true turns it on for a hosted demo without SMTP.
  exposeCodes: !isProd || process.env.DEMO_MODE === 'true',
  isTest: process.env.NODE_ENV === 'test',
  port: num(process.env.PORT, 5050),
  clientOrigins: [
    ...(process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((o) => o.trim()),
    ...vercelOrigins,
  ].filter(Boolean),
  // MONGODB_URI is the name Vercel's MongoDB Atlas integration uses.
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  },
  bcryptRounds: num(process.env.BCRYPT_ROUNDS, 12),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'College Admissions <no-reply@college.test>',
  },
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  uploads: {
    dir: path.isAbsolute(process.env.UPLOAD_DIR || '')
      ? process.env.UPLOAD_DIR
      : path.join(serverRoot, process.env.UPLOAD_DIR || 'uploads'),
    maxBytes: num(process.env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
    allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    feePaise: num(process.env.APPLICATION_FEE_PAISE, 75000),
  },
  // UPI QR payment: shown on the Payment page when a payee name is set.
  upi: {
    payeeName: process.env.UPI_PAYEE_NAME || '',
    qrUrl: process.env.UPI_QR_URL || '/payments/upi-qr.png',
  },
  admissionCycle: process.env.ADMISSION_CYCLE || '2026-27',
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@college.test',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
    officerEmail: process.env.SEED_OFFICER_EMAIL || 'officer@college.test',
    officerPassword: process.env.SEED_OFFICER_PASSWORD || 'Officer@12345',
  },
};

// Fail closed: a production build must never sign tokens with the public dev secrets.
const DEV_SECRETS = ['dev-access-secret', 'dev-refresh-secret', 'change-me-access-secret', 'change-me-refresh-secret'];
if (env.isProd && (DEV_SECRETS.includes(env.jwt.accessSecret) || DEV_SECRETS.includes(env.jwt.refreshSecret))) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set to private values in production');
}

export default env;
