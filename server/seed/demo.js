/* npm run demo:reset — puts the demo student back to "ready to pay". */
import { connectDb, disconnectDb } from '../src/config/db.js';
import { logger } from '../src/utils/logger.js';
import { seedDemoStudent, DEMO_STUDENT } from './demoStudent.js';

const run = async () => {
  await connectDb();
  const { application } = await seedDemoStudent();
  logger.info(`Demo student ready: ${DEMO_STUDENT.email} / ${DEMO_STUDENT.password} — ${application.applicationNo}, fee unpaid`);
  await disconnectDb();
};

run().catch(async (err) => {
  logger.error('Demo reset failed', err);
  await disconnectDb();
  process.exit(1);
});
