import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global authentication setup project.
 *
 * Runs once before dependent browser projects and saves storageState.
 * (In Stage 6, this performs actual UI login on https://aura-eyecare.vercel.app/login).
 */
const authFile = path.resolve(process.cwd(), '.auth/admin.json');

setup('authenticate as admin', async () => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }, null, 2), {
    flag: 'w',
  });
});
