import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

const localDriver = {
  name: 'local',
  async upload(file, { folder = 'documents' } = {}) {
    const dir = path.join(env.uploads.dir, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname) || '';
    const key = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    await fs.writeFile(path.join(dir, key), file.buffer);

    return {
      url: `/uploads/${folder}/${key}`,
      publicId: `${folder}/${key}`,
      driver: 'local',
    };
  },
  async remove(publicId) {
    if (!publicId) return;
    await fs.rm(path.join(env.uploads.dir, publicId), { force: true });
  },
};

const cloudinaryDriver = {
  name: 'cloudinary',
  upload(file, { folder = 'documents' } = {}) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `admissions/${folder}`, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          return resolve({ url: result.secure_url, publicId: result.public_id, driver: 'cloudinary' });
        },
      );
      stream.end(file.buffer);
    });
  },
  async remove(publicId) {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  },
};

/** Vercel Blob — used on Vercel, where the function filesystem is read-only. */
const blobDriver = {
  name: 'blob',
  async upload(file, { folder = 'documents' } = {}) {
    const { put } = await import('@vercel/blob');
    const ext = path.extname(file.originalname) || '';
    const blob = await put(`documents/${folder}/${crypto.randomBytes(8).toString('hex')}${ext}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      token: env.blobToken,
    });
    return { url: blob.url, publicId: blob.url, driver: 'blob' };
  },
  async remove(publicId) {
    if (!publicId?.startsWith('http')) return;
    const { del } = await import('@vercel/blob');
    await del(publicId, { token: env.blobToken });
  },
};

/** Cloudinary when configured, then Vercel Blob, then local disk. */
const pick = () => {
  if (isCloudinaryConfigured) return cloudinaryDriver;
  if (env.blobToken) return blobDriver;
  return localDriver;
};
export const storage = pick();

if (storage === localDriver) {
  logger.warn(`Cloudinary/Blob not configured — uploads go to ${env.uploads.dir}`);
  if (env.isVercel) logger.error('Running on Vercel without BLOB_READ_WRITE_TOKEN: uploads will fail (read-only filesystem)');
}

export const uploadFile = (file, options) => storage.upload(file, options);
export const removeFile = (publicId) => storage.remove(publicId);
export default storage;
