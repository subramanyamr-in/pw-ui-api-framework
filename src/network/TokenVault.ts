import fs from 'fs';
import path from 'path';

/**
 * TokenVault provides process-safe storage and retrieval for API authentication tokens.
 *
 * WHY:
 * Playwright parallel workers execute in separate Node.js processes.
 * In-memory static variables are NOT shared between workers.
 * TokenVault stores tokens in `.auth/` so any worker can read or verify tokens safely.
 *
 * TEACHING ANALOGY:
 * Like a shared physical key lockbox at a worksite. Instead of every worker trying
 * to pass a key through mental telepathy (in-memory RAM), the key is kept in a
 * designated secure box that all authorized workers can access.
 */
export class TokenVault {
  private static readonly tokenDir = path.resolve(process.cwd(), '.auth');

  /**
   * Saves an authentication token for a given role (e.g. 'admin', 'doctor', 'patient').
   */
  static saveToken(role: string, token: string): void {
    if (!fs.existsSync(this.tokenDir)) {
      fs.mkdirSync(this.tokenDir, { recursive: true });
    }
    const tokenFile = path.join(this.tokenDir, `${role}-token.txt`);
    fs.writeFileSync(tokenFile, token, 'utf-8');
  }

  /**
   * Retrieves the authentication token for a given role.
   * Throws an explicit, helpful error if no token is found.
   */
  static getToken(role: string): string {
    const tokenFile = path.join(this.tokenDir, `${role}-token.txt`);
    if (!fs.existsSync(tokenFile)) {
      throw new Error(
        `[TokenVault] No token found on disk for role "${role}". ` +
          `Ensure an authentication call (e.g., AuthService.login()) was executed prior to this request.`
      );
    }
    return fs.readFileSync(tokenFile, 'utf-8').trim();
  }

  /**
   * Returns an Authorization header object: { Authorization: 'Bearer <token>' }.
   */
  static getAuthHeader(role: string): Record<string, string> {
    return { Authorization: `Bearer ${this.getToken(role)}` };
  }

  /**
   * Checks whether a token exists for a given role.
   */
  static hasToken(role: string): boolean {
    const tokenFile = path.join(this.tokenDir, `${role}-token.txt`);
    return fs.existsSync(tokenFile);
  }

  /**
   * Clears a stored token for a specific role.
   */
  static clearToken(role: string): void {
    const tokenFile = path.join(this.tokenDir, `${role}-token.txt`);
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }
  }

  /**
   * Clears all stored tokens in `.auth/`.
   */
  static clearAll(): void {
    if (fs.existsSync(this.tokenDir)) {
      const files = fs.readdirSync(this.tokenDir);
      for (const file of files) {
        if (file.endsWith('-token.txt')) {
          fs.unlinkSync(path.join(this.tokenDir, file));
        }
      }
    }
  }
}
