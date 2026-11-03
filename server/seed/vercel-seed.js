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
const hasDb = Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);

if (process.env.SEED_ON_BUILD !== 'true') {
  process.stdout.write('[seed] SEED_ON_BUILD is not "true" — skipping database seed\n');
} else if (!hasDb) {
  process.stdout.write('[seed] No MONGO_URI / MONGODB_URI configured — skipping database seed\n');
} else {
  const result = spawnSync(process.execPath, [path.join(here, 'seed.js')], { stdio: 'inherit' });
  process.exit(result.status ?? 1);
}
