import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Course } from '../src/models/Course.js';
import { env } from '../src/config/env.js';
import { clearDatabase } from './setup.js';

const app = createApp();

beforeAll(async () => {
  await clearDatabase();
  await Course.insertMany(
    Array.from({ length: 25 }, (_, i) => ({
      code: `C${String(i).padStart(3, '0')}`,
      name: `Course ${i}`,
      department: 'Computer Science',
      degreeLevel: 'UG',
      durationYears: 3,
      totalSeats: 60,
      admissionCycle: env.admissionCycle,
    })),
  );
});

describe('list pagination', () => {
  it('defaults to 20 items per page', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.body.data.courses).toHaveLength(20);
    expect(res.body.data.pagination).toMatchObject({ total: 25, page: 1, limit: 20, pages: 2 });
  });

  it('serves the next page', async () => {
    const res = await request(app).get('/api/v1/courses?page=2');
    expect(res.body.data.courses).toHaveLength(5);
  });

  it('caps the limit at 100', async () => {
    const res = await request(app).get('/api/v1/courses?limit=5000');
    expect(res.body.data.pagination.limit).toBe(100);
    expect(res.body.data.courses).toHaveLength(25);
  });

  it('paginates the public merit lists too', async () => {
    const res = await request(app).get('/api/v1/merit/published');
    expect(res.body.data.pagination).toMatchObject({ page: 1, limit: 20 });
  });
});
