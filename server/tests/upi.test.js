import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Application } from '../src/models/Application.js';
import { Document } from '../src/models/Document.js';
import { Payment } from '../src/models/Payment.js';
import { ROLES } from '../src/constants/roles.js';
import { STATUS } from '../src/constants/status.js';
import { env } from '../src/config/env.js';
import { checkCompleteness } from '../src/services/application.js';
import { clearDatabase } from './setup.js';

const app = createApp();
const UTR = '412345678901';

const makeUser = async (role, email) => {
  const user = new User({ name: `${role} user`, email, phone: '9845012345', role, isEmailVerified: true });
  await user.setPassword('Secret@12345');
  await user.save();
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Secret@12345' });
  return { user, token: res.body.data.accessToken };
};

const makeApplication = (applicant, status = STATUS.DRAFT) =>
  Application.create({
    applicationNo: `ADM2026${Math.floor(Math.random() * 900000 + 100000)}`,
    applicant: applicant._id,
    admissionCycle: env.admissionCycle,
    status,
    statusHistory: [{ from: 'NEW', to: status, at: new Date() }],
  });

const submitUtr = (token, upiReference = UTR) =>
  request(app).post('/api/v1/payments/upi').set('Authorization', `Bearer ${token}`).send({ upiReference });

let applicant;
let officer;

beforeEach(async () => {
  await clearDatabase();
  applicant = await makeUser(ROLES.APPLICANT, 'applicant@example.com');
  officer = await makeUser(ROLES.OFFICER, 'officer@college.test');
});

describe('POST /payments/upi', () => {
  it('records the UPI reference as awaiting verification at the full fee', async () => {
    await makeApplication(applicant.user);
    const res = await submitUtr(applicant.token);
    expect(res.status).toBe(200);
    expect(res.body.data.payment).toMatchObject({ status: 'PENDING_VERIFICATION', method: 'upi_qr', upiReference: UTR });
    expect(res.body.data.payment.amount).toBe(env.razorpay.feePaise);
  });

  it('rejects a reference that is not 12 digits', async () => {
    await makeApplication(applicant.user);
    expect((await submitUtr(applicant.token, '12345')).status).toBe(400);
  });

  it('refuses a reference already used by another application', async () => {
    await makeApplication(applicant.user);
    await submitUtr(applicant.token);
    const other = await makeUser(ROLES.APPLICANT, 'other@example.com');
    await makeApplication(other.user);
    expect((await submitUtr(other.token)).status).toBe(409);
  });

  it('counts as paid for submission while awaiting verification', async () => {
    const application = await makeApplication(applicant.user);
    await submitUtr(applicant.token);
    const payment = await Payment.findOne({ application: application._id });
    const { missing } = checkCompleteness(application, { documents: [], payment });
    expect(missing.some((m) => m.step === 'payment')).toBe(false);
  });
});

describe('PATCH /payments/:id/verify', () => {
  it('lets an officer mark the payment as paid', async () => {
    await makeApplication(applicant.user);
    const { body } = await submitUtr(applicant.token);
    const res = await request(app)
      .patch(`/api/v1/payments/${body.data.payment._id}/verify`)
      .set('Authorization', `Bearer ${officer.token}`)
      .send({ decision: 'PAID' });
    expect(res.status).toBe(200);
    expect(res.body.data.payment.status).toBe('PAID');
  });

  it('requires a reason to reject, then lets the applicant resubmit', async () => {
    await makeApplication(applicant.user);
    const { body } = await submitUtr(applicant.token);
    const url = `/api/v1/payments/${body.data.payment._id}/verify`;
    expect((await request(app).patch(url).set('Authorization', `Bearer ${officer.token}`).send({ decision: 'REJECTED' })).status).toBe(400);
    const rejected = await request(app).patch(url).set('Authorization', `Bearer ${officer.token}`)
      .send({ decision: 'REJECTED', reason: 'No matching credit' });
    expect(rejected.body.data.payment.status).toBe('FAILED');
    const again = await submitUtr(applicant.token, '512345678901');
    expect(again.body.data.payment.status).toBe('PENDING_VERIFICATION');
  });

  it('is closed to applicants', async () => {
    await makeApplication(applicant.user);
    const { body } = await submitUtr(applicant.token);
    const res = await request(app)
      .patch(`/api/v1/payments/${body.data.payment._id}/verify`)
      .set('Authorization', `Bearer ${applicant.token}`)
      .send({ decision: 'PAID' });
    expect(res.status).toBe(403);
  });
});

describe('verification gate', () => {
  it('refuses VERIFIED until the fee is confirmed', async () => {
    const application = await makeApplication(applicant.user, STATUS.UNDER_REVIEW);
    await Document.create({ application: application._id, type: 'PHOTO', url: '/x.png', verificationStatus: 'APPROVED' });
    const { body } = await submitUtr(applicant.token);

    const blocked = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${officer.token}`)
      .send({ to: STATUS.VERIFIED });
    expect(blocked.status).toBe(400);
    expect(blocked.body.message).toMatch(/fee/i);

    await request(app).patch(`/api/v1/payments/${body.data.payment._id}/verify`)
      .set('Authorization', `Bearer ${officer.token}`).send({ decision: 'PAID' });
    const allowed = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${officer.token}`)
      .send({ to: STATUS.VERIFIED });
    expect(allowed.status).toBe(200);
  });
});
