import { test as base } from '@playwright/test';
import { HttpDriver, TokenVault } from '@network';
import { AuthService } from '@services';
import { logger } from '@utils';
import { TestDataRegistry } from '@data';

export interface ApiFixtures {
  http: HttpDriver;
  tokenVault: typeof TokenVault;
  authService: AuthService;
  logger: typeof logger;
  registry: TestDataRegistry;
}

/**
 * Dedicated API Test Fixture.
 * Automatically instantiates typed HttpDriver, domain services, and TestDataRegistry with post-test auto-cleanup.
 */
export const apiTest = base.extend<ApiFixtures>({
  logger: async ({}, use) => {
    await use(logger);
  },

  http: async ({ request }, use) => {
    const httpDriver = new HttpDriver(request);
    await use(httpDriver);
  },

  tokenVault: async ({}, use) => {
    await use(TokenVault);
  },

  authService: async ({ http }, use) => {
    const authService = new AuthService(http);
    await use(authService);
  },

  registry: async ({}, use) => {
    const registry = new TestDataRegistry();
    await use(registry);
    // Unconditional post-test teardown runs here!
    await registry.cleanupAll();
  },
});
