/**
 * Runs after the Vercel build. Seeds the hosted database only when
 * SEED_ON_BUILD=true and a database URL is configured, so the connection
 * string never has to leave Vercel. The seed is idempotent; note that it also
 * resets the staff passwords and the demo student on every seeded build.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const hasDb = ['MONGO_URI', 'MONGODB_URI', 'MONGODB_URL', 'STORAGE_URL'].some((k) => process.env[k]);

if (process.env.SEED_ON_BUILD !== 'true') {
  process.stdout.write('[seed] SEED_ON_BUILD is not "true" — skipping database seed\n');
} else if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_OFFICER_PASSWORD) {
  // The defaults are printed in the public README — never seed a hosted site with them.
  process.stdout.write('[seed] Set SEED_ADMIN_PASSWORD and SEED_OFFICER_PASSWORD first — skipping database seed\n');
} else if (!hasDb) {
  process.stdout.write('[seed] No database URL (MONGO_URI / MONGODB_URL) configured — skipping database seed\n');
} else {
  const result = spawnSync(process.execPath, [path.join(here, 'seed.js')], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
