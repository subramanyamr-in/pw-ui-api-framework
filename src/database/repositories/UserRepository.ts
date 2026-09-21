import { BaseRepository } from './BaseRepository';

export interface UserRecord {
  id: string | number;
  email: string;
  name?: string;
  role?: string;
  is_active?: boolean;
  verification_token?: string;
  created_at?: string | Date;
}

/**
 * UserRepository handles database operations related to user accounts.
 *
 * USED FOR:
 * 1. Test data setup (verifying pre-existing accounts).
 * 2. Test teardown (deleting test users created during registration tests).
 * 3. Out-of-band verification (reading OTPs or verification tokens directly from DB).
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Finds a user by their email address.
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.findOneBy<UserRecord>('email', email);
  }

  /**
   * Deletes a user by email (for test cleanup).
   */
  async deleteByEmail(email: string): Promise<number> {
    return this.deleteBy('email', email);
  }

  /**
   * Retrieves an email verification token or OTP directly from the database.
   * Useful for bypassing slow email delivery in E2E signup/reset password flows.
   */
  async getVerificationToken(email: string): Promise<string | null> {
    const user = await this.queryOne<{ verification_token: string }>(
      `SELECT verification_token FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
    return user?.verification_token ?? null;
  }
}
