import { hybridTest as test, expect } from '@fixtures';

test.describe('Hybrid 360-Degree Workflow @smoke', () => {
  test('Unified fixture injects UI, API, DB, and Registry capabilities cleanly @smoke', async ({
    page,
    basePage,
    http,
    tokenVault,
    authService,
    db,
    userRepo,
    registry,
    logger,
  }) => {
    // 1. Verify UI fixture injection
    expect(page).toBeDefined();
    expect(basePage).toBeDefined();

    // 2. Verify API & Service fixture injection
    expect(http).toBeDefined();
    expect(tokenVault).toBeDefined();
    expect(authService).toBeDefined();

    // 3. Verify Database client & Repository fixture injection
    expect(db).toBeDefined();
    expect(userRepo).toBeDefined();

    // 4. Verify Logger & Registry auto-cleanup injection
    expect(logger).toBeDefined();
    expect(registry).toBeDefined();
    expect(registry.count).toBe(0);
  });

  test('E2E lifecycle with UI navigation, DB check, and automated Registry teardown @regression', async ({
    basePage,
    db,
    registry,
    logger,
  }) => {
    logger.info('Starting Hybrid 360° test execution...');

    // 1. UI Layer: Navigation
    await basePage.navigate('/');
    expect(basePage.getUrl()).toContain('https://aura-eyecare.vercel.app');

    // 2. DB Layer: Connectivity & Health check
    const healthy = await db.isHealthy();
    expect(typeof healthy).toBe('boolean');

    // 3. Data Lifecycle Layer: Register seeded test artifact for automatic cleanup
    let cleanupExecuted = false;
    registry.register('patient_session', 'test-session-123', () => {
      cleanupExecuted = true;
      logger.info('Cleaned up patient_session test-session-123');
    });

    expect(registry.count).toBe(1);

    // Teardown is automatically triggered by fixture after test completes!
    // We can also verify manually that calling cleanupAll resets count
    await registry.cleanupAll();
    expect(cleanupExecuted).toBe(true);
    expect(registry.count).toBe(0);
  });
});
