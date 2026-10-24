/** Reads JWT_SECRET from the environment; fails loudly instead of signing tokens with `undefined`. */
export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set — copy .env.example to .env and set it (dotenv must load before this runs).');
  }
  return secret;
}

export const TOKEN_EXPIRY = '1h';
