/**
 * A fully completed applicant for live demonstrations: every form section,
 * course preferences and all four required documents are in place — only the
 * application fee is left, so the demo starts at "Pay by UPI".
 * Re-running it resets the account to exactly that state.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Application } from '../src/models/Application.js';
import { Document } from '../src/models/Document.js';
import { Payment } from '../src/models/Payment.js';
import { Notification } from '../src/models/Notification.js';
import { MeritList } from '../src/models/MeritList.js';
import { ROLES } from '../src/constants/roles.js';
import { STATUS } from '../src/constants/status.js';
import { env } from '../src/config/env.js';
import { computePercentage } from '../src/services/application.js';
import { nextApplicationNo } from '../src/services/applicationNumber.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Seed documents are static files of the client (served at /seed-files/…),
// so they open locally and on Vercel without any upload storage.
const FILES = path.join(here, '../../client/public/seed-files');

export const DEMO_STUDENT = { name: 'Arjun Ramesh', email: 'arjun.ramesh@example.com', password: 'Arjun@2026', phone: '9884512370' };

const SUBJECTS = [
  { name: 'English', maxMarks: 100, obtained: 91 },
  { name: 'Mathematics', maxMarks: 100, obtained: 96 },
  { name: 'Physics', maxMarks: 100, obtained: 93 },
  { name: 'Chemistry', maxMarks: 100, obtained: 90 },
  { name: 'Computer Science', maxMarks: 100, obtained: 97 },
];

const DOCS = [
  ['TENTH_MARKSHEET', 'tenth_marksheet.pdf', 'application/pdf'],
  ['TWELFTH_MARKSHEET', 'twelfth_marksheet.pdf', 'application/pdf'],
  ['PHOTO', 'photo.png', 'image/png'],
  ['SIGNATURE', 'signature.png', 'image/png'],
];

export const seedDemoStudent = async () => {
  let user = await User.findOne({ email: DEMO_STUDENT.email });
  if (!user) user = new User({ email: DEMO_STUDENT.email });
  Object.assign(user, { name: DEMO_STUDENT.name, phone: DEMO_STUDENT.phone, role: ROLES.APPLICANT, isEmailVerified: true, isActive: true, mustChangePassword: false });
  user.refreshTokenHash = undefined;
  await user.setPassword(DEMO_STUDENT.password);
  await user.save();

  // Wipe everything from a previous demo run, keeping the application number stable.
  const old = await Application.find({ applicant: user._id });
  const keepNo = old[0]?.applicationNo;
  for (const app of old) {
    await Document.deleteMany({ application: app._id });
    await Payment.deleteMany({ application: app._id });
    await MeritList.updateMany({ isPublished: false }, { $pull: { entries: { application: app._id } } });
    await fs.rm(path.join(env.uploads.dir, String(app._id)), { recursive: true, force: true });
  }
  await Application.deleteMany({ applicant: user._id });
  await Notification.deleteMany({ user: user._id });

  const courses = await Course.find({ code: { $in: ['BTCSE', 'BTECE'] } });
  const byCode = Object.fromEntries(courses.map((c) => [c.code, c._id]));

  const application = new Application({
    applicationNo: keepNo || (await nextApplicationNo(env.admissionCycle)),
    applicant: user._id,
    admissionCycle: env.admissionCycle,
    status: STATUS.DRAFT,
    personal: { fatherName: 'Ramesh Kumar', motherName: 'Lakshmi Ramesh', dob: new Date('2008-03-14'), gender: 'MALE', category: 'GENERAL', nationality: 'Indian' },
    address: { line1: '14, Bharathi Nagar 2nd Street, Ramapuram', line2: 'Near Ramapuram Bus Stand', city: 'Chennai', state: 'Tamil Nadu', pincode: '600089' },
    academics: { board: 'CBSE', schoolName: 'Kendriya Vidyalaya, Chennai', yearOfPassing: 2026, subjects: SUBJECTS, percentage: computePercentage(SUBJECTS) },
    coursePreferences: [{ course: byCode.BTCSE, priority: 1 }, { course: byCode.BTECE, priority: 2 }].filter((p) => p.course),
    statusHistory: [{ from: 'NEW', to: STATUS.DRAFT, changedBy: user._id, remarks: 'Application started', at: new Date() }],
  });
  await application.save();

  const docs = [];
  for (const [type, file, mimeType] of DOCS) {
    const { size } = await fs.stat(path.join(FILES, 'demo', file));
    docs.push(await Document.create({
      application: application._id, type, originalName: file, url: `/seed-files/demo/${file}`,
      publicId: `seed-files/demo/${file}`, storageDriver: 'local', mimeType, sizeBytes: size,
    }));
  }
  application.documents = docs.map((d) => d._id);
  await application.save();

  return { user, application };
};

export default seedDemoStudent;
