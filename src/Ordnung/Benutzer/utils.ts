
// ./src/Ordnung/Benutzer/utils.ts
import SHA256 from 'crypto-js/sha256';

/**
 * Hash a password three times using SHA256.
 * @param password The password to hash.
 * @returns The triple-hashed password as a hex string.
 */
export const hashPassword = (password: string): string => {
  const hash1 = SHA256(password);
  const hash2 = SHA256(hash1);
  const hash3 = SHA256(hash2);
  return hash3.toString();
};

/**
 * Generates a shorter user ID by hashing the current timestamp and truncating it.
 * @returns A 12-character SHA256 hash of the current date and time string.
 */
export const generateUserId = (): string => {
  const now = new Date();
  const dateString = `${now.getSeconds()}:${now.getMinutes()}:${now.getHours()}:${now.getDate()}:${now.getMonth() + 1}:${now.getFullYear()}`;
  // Truncate the full hash to the first 12 characters for better readability
  return SHA256(dateString).toString().substring(0, 12);
}
