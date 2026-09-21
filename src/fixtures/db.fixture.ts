import { test as base } from '@playwright/test';
import { DbClient } from '@database';
import { UserRepository } from '@repositories';
import { logger } from '@utils';

export interface DbFixtures {
  db: typeof DbClient;
  userRepo: UserRepository;
  logger: typeof logger;
}

/**
 * Dedicated Database Test Fixture.
 * Provides pre-configured database client and repository instances.
 */
export const dbTest = base.extend<DbFixtures>({
  logger: async ({}, use) => {
    await use(logger);
  },

  db: async ({}, use) => {
    await use(DbClient);
  },

  userRepo: async ({}, use) => {
    const repository = new UserRepository();
    await use(repository);
  },
});
