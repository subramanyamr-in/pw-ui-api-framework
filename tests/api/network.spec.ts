import { test, expect } from '@playwright/test';
import { HttpDriver, TokenVault } from '@network';
import { config } from '@config';

test.describe('Network Layer Verification @smoke', () => {
  test('TokenVault stores and retrieves tokens safely @smoke', async () => {
    const testRole = 'test-admin';
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample';

    TokenVault.saveToken(testRole, sampleToken);

    expect(TokenVault.hasToken(testRole)).toBe(true);
    expect(TokenVault.getToken(testRole)).toBe(sampleToken);

    const authHeader = TokenVault.getAuthHeader(testRole);
    expect(authHeader).toEqual({ Authorization: `Bearer ${sampleToken}` });

    TokenVault.clearToken(testRole);
    expect(TokenVault.hasToken(testRole)).toBe(false);
  });

  test('HttpDriver initializes and performs HTTP requests @smoke', async ({ request }) => {
    const http = new HttpDriver(request);

    // Make a raw request to verify status code handling
    const response = await http.getRaw(config.app.baseUrl);
    expect(response.status()).toBeLessThan(500);
  });
});
