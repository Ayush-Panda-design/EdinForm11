/** Patterns that indicate raw infrastructure errors — never show these to end users. */
const INTERNAL_ERROR_PATTERNS = [
  /column "[^"]+" of relation "[^"]+" does not exist/i,
  /relation "[^"]+" does not exist/i,
  /duplicate key value violates unique constraint/i,
  /violates (foreign key|not-null|check) constraint/i,
  /syntax error at or near/i,
  /connection terminated unexpectedly/i,
  /ECONNREFUSED/i,
  /password authentication failed/i,
  /Database not initialized/i,
];

export function isInternalInfrastructureError(message: string): boolean {
  return INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export const USER_FACING_INTERNAL_ERROR =
  "Something went wrong on our end. Please try again in a moment.";
