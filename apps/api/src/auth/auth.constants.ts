const DEV_SECRET = 'dev-only-secret-change-me';

export function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? DEV_SECRET;
}

export function getJwtExpiresInSeconds(): number {
  return Number(process.env.JWT_EXPIRES_IN ?? 3600);
}
