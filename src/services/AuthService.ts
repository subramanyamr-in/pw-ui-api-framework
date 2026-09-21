import { BaseService } from './BaseService';
import { type LoginRequest, type LoginResponse, LoginResponseSchema } from '@schemas';
import { TokenVault } from '@network';
import type { HttpDriver } from '@network';

/**
 * Domain service for authentication operations.
 */
export class AuthService extends BaseService {
  constructor(http: HttpDriver) {
    super(http, '/auth');
  }

  /**
   * Logs in with email/password, validates the response schema,
   * and saves the token to TokenVault for parallel execution.
   */
  async login(credentials: LoginRequest, role = 'admin'): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(
      '/login',
      credentials,
      undefined,
      LoginResponseSchema
    );

    if (response.token) {
      TokenVault.saveToken(role, response.token);
    }

    return response;
  }
}
