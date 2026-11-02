const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function hasErrorCode(err: unknown, expected: string): boolean {
  const code = (e: unknown) => (e as { code?: string } | undefined)?.code;
  return (
    code(err) === expected ||
    code((err as { cause?: unknown } | undefined)?.cause) === expected
  );
}

export function isUniqueViolation(err: unknown): boolean {
  return hasErrorCode(err, UNIQUE_VIOLATION);
}

export function isForeignKeyViolation(err: unknown): boolean {
  return hasErrorCode(err, FOREIGN_KEY_VIOLATION);
}
