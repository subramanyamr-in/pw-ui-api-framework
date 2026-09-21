import { apiTest as test, expect } from '@fixtures';
import { SchemaValidator, LoginResponseSchema, PaginationSchema, ApiErrorSchema } from '@schemas';

test.describe('API Contract Suite @smoke', () => {
  test('validates LoginResponseSchema contract @smoke', async () => {
    const validPayload = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
      user: {
        id: 'usr_abc_789',
        email: 'staff@aura-eyecare.com',
        role: 'staff',
      },
    };

    const parsed = SchemaValidator.validate(LoginResponseSchema, validPayload);
    expect(parsed.token).toBe(validPayload.token);
    expect(parsed.user.role).toBe('staff');
  });

  test('detects backend schema drift and missing fields @regression', async () => {
    const driftedPayload = {
      user: {
        id: 'usr_drifted',
        email: 'not-an-email',
      },
    };

    expect(() => {
      SchemaValidator.validate(LoginResponseSchema, driftedPayload);
    }).toThrow(/\[SchemaValidator\] Contract violation/);
  });

  test('validates error response contracts with ApiErrorSchema @regression', async () => {
    const errorPayload = {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid session token',
    };

    expect(SchemaValidator.isValid(ApiErrorSchema, errorPayload)).toBe(true);
    expect(SchemaValidator.isValid(PaginationSchema, errorPayload)).toBe(false);
  });
});
