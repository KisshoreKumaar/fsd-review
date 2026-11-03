import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { ROLES } from '../src/constants/roles.js';
import { clearDatabase } from './setup.js';

const app = createApp();
const EMAIL = 'meera.krishnan@example.com';

const makeUser = async (over = {}) => {
  const user = new User({
    name: 'Meera Krishnan',
    email: EMAIL,
    phone: '9900112233',
    role: ROLES.APPLICANT,
    isEmailVerified: true,
    ...over,
  });
  await user.setPassword('OldPass@123');
  await user.save();
  return user;
};

const login = (password) => request(app).post('/api/v1/auth/login').send({ email: EMAIL, password });

beforeEach(async () => {
  await clearDatabase();
});

describe('POST /auth/change-password', () => {
  it('changes the password and signs out other sessions', async () => {
    await makeUser();
    const first = await login('OldPass@123');
    const otherCookie = first.headers['set-cookie'];

    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${first.body.data.accessToken}`)
      .send({ currentPassword: 'OldPass@123', newPassword: 'NewPass@456' });

    expect(res.status).toBe(200);
    expect((await login('OldPass@123')).status).toBe(401);
    expect((await login('NewPass@456')).status).toBe(200);
    const stale = await request(app).post('/api/v1/auth/refresh').set('Cookie', otherCookie);
    expect(stale.status).toBe(401);
  });

  it('rejects a wrong current password', async () => {
    await makeUser();
    const { body } = await login('OldPass@123');
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${body.data.accessToken}`)
      .send({ currentPassword: 'Wrong@1234', newPassword: 'NewPass@456' });
    expect(res.status).toBe(400);
  });

  it('enforces the password policy', async () => {
    await makeUser();
    const { body } = await login('OldPass@123');
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${body.data.accessToken}`)
      .send({ currentPassword: 'OldPass@123', newPassword: 'short' });
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/auth/change-password')
      .send({ currentPassword: 'a', newPassword: 'NewPass@456' });
    expect(res.status).toBe(401);
  });
});

describe('temporary passwords', () => {
  it('blocks other APIs until the password is changed', async () => {
    await makeUser({ role: ROLES.OFFICER, mustChangePassword: true });
    const { body } = await login('OldPass@123');
    expect(body.data.user.mustChangePassword).toBe(true);
    const token = body.data.accessToken;

    const blocked = await request(app).get('/api/v1/applications').set('Authorization', `Bearer ${token}`);
    expect(blocked.status).toBe(403);
    expect(blocked.body.errors[0].message).toBe('PASSWORD_CHANGE_REQUIRED');

    const changed = await request(app)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'OldPass@123', newPassword: 'NewPass@456' });
    expect(changed.body.data.user.mustChangePassword).toBe(false);

    const allowed = await request(app)
      .get('/api/v1/applications')
      .set('Authorization', `Bearer ${changed.body.data.accessToken}`);
    expect(allowed.status).toBe(200);
  });
});

describe('forgot / reset password', () => {
  it('gives the same answer whether or not the account exists', async () => {
    await makeUser();
    const known = await request(app).post('/api/v1/auth/forgot-password').send({ email: EMAIL });
    const unknown = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' });
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body.message).toBe(unknown.body.message);
  });

  it('resets the password with a valid code and revokes sessions', async () => {
    await makeUser();
    const session = await login('OldPass@123');
    const { body } = await request(app).post('/api/v1/auth/forgot-password').send({ email: EMAIL });

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ email: EMAIL, code: body.data.devOtp, newPassword: 'Reset@7890' });
    expect(res.status).toBe(200);
    expect((await login('Reset@7890')).status).toBe(200);
    const stale = await request(app).post('/api/v1/auth/refresh').set('Cookie', session.headers['set-cookie']);
    expect(stale.status).toBe(401);
  });

  it('rejects a wrong code and leaves the password unchanged', async () => {
    await makeUser();
    await request(app).post('/api/v1/auth/forgot-password').send({ email: EMAIL });
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ email: EMAIL, code: '000000', newPassword: 'Reset@7890' });
    expect(res.status).toBe(400);
    expect((await login('OldPass@123')).status).toBe(200);
  });
});
