import bcrypt from "bcrypt";

/**
 * Hash a plain text password
 * @param password - The plain password
 * @param saltRounds - Number of salt rounds (default: 10)
 * @returns The hashed password
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - The plain password to check
 * @param hashedPassword - The hashed password from DB
 * @returns true if match, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
