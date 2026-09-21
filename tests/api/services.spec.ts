import { apiTest as test, expect } from '@fixtures';
import { SchemaValidator, LoginResponseSchema, PaginationSchema, ApiErrorSchema } from '@schemas';

test.describe('API Services & Schema Validation @smoke', () => {
  test('SchemaValidator passes valid response payload @smoke', async () => {
    const sampleResponse = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample',
      user: {
        id: 'usr_123',
        email: 'doctor@eyecare.com',
        role: 'doctor',
      },
    };

    const validated = SchemaValidator.validate(LoginResponseSchema, sampleResponse);
    expect(validated.token).toBe(sampleResponse.token);
    expect(validated.user.email).toBe('doctor@eyecare.com');
  });

  test('SchemaValidator throws descriptive error on invalid schema @smoke', async () => {
    const invalidPayload = {
      // missing required 'token'
      user: {
        id: 123,
        email: 'invalid-email-format',
      },
    };

    expect(() => {
      SchemaValidator.validate(LoginResponseSchema, invalidPayload);
    }).toThrow(/\[SchemaValidator\] Contract violation/);
  });

  test('Common schemas validate standard API contracts @regression', async () => {
    const validPagination = {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    };
    expect(SchemaValidator.isValid(PaginationSchema, validPagination)).toBe(true);

    const validError = {
      error: 'Not Found',
      statusCode: 404,
      message: 'User does not exist',
    };
    expect(SchemaValidator.isValid(ApiErrorSchema, validError)).toBe(true);
  });

  test('apiTest fixture injects http and authService cleanly @smoke', async ({
    http,
    tokenVault,
    authService,
  }) => {
    expect(http).toBeDefined();
    expect(tokenVault).toBeDefined();
    expect(authService).toBeDefined();
  });
});
