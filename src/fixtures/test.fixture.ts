import { mergeTests } from '@playwright/test';
import { uiTest } from './ui.fixture';
import { apiTest } from './api.fixture';
import { dbTest } from './db.fixture';

/**
 * Unified / Hybrid Test Fixture merging UI, API, and DB capabilities.
 *
 * HOW TO USE IN TESTS:
 * import { hybridTest, expect } from '@fixtures';
 *
 * hybridTest('Full E2E 360 flow', async ({ page, basePage, http, db, userRepo, registry }) => {
 *   // All layers accessible in a single, typed test!
 * });
 */
export const test = mergeTests(uiTest, apiTest, dbTest);
export const hybridTest = test;

export { expect } from '@playwright/test';
