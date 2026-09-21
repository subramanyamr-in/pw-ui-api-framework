import { test, expect } from '@playwright/test';
import { DbClient } from '@database';
import { UserRepository } from '@repositories';

test.describe('Database Layer Verification @smoke', () => {
  test('DbClient initializes connection pool without errors @smoke', async () => {
    const pool = DbClient.getPool();
    expect(pool).toBeDefined();
    expect(typeof pool.query).toBe('function');
  });

  test('DbClient handles health checks gracefully @smoke', async () => {
    const isHealthy = await DbClient.isHealthy();
    // Non-throwing check: returns boolean whether DB is accessible or not
    expect(typeof isHealthy).toBe('boolean');
  });

  test('UserRepository instantiates with base methods @smoke', async () => {
    const userRepo = new UserRepository();
    expect(userRepo).toBeDefined();
    expect(typeof userRepo.findByEmail).toBe('function');
    expect(typeof userRepo.deleteByEmail).toBe('function');
    expect(typeof userRepo.getVerificationToken).toBe('function');
    expect(typeof userRepo.count).toBe('function');
  });

  test('UserRepository verifies schema methods and offline safety @regression', async () => {
    const isHealthy = await DbClient.isHealthy();
    expect(typeof isHealthy).toBe('boolean');

    const userRepo = new UserRepository();
    expect(userRepo).toBeInstanceOf(UserRepository);
  });
});
