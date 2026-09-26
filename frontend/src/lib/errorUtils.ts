/**
 * Extracts a safe, friendly error message from GraphQL, Axios, or standard JS errors.
 * Ensures internal system details (DTO names, database errors, stack traces) are masked.
 */
export function getFriendlyErrorMessage(error: any, fallbackMessage = 'An error occurred. Please check your inputs and try again.'): string {
  if (!error) return fallbackMessage;

  // 1. Try GraphQL error message
  const gqlMsg = error?.graphQLErrors?.[0]?.message;
  if (typeof gqlMsg === 'string' && isSafeMessage(gqlMsg)) {
    return cleanMessage(gqlMsg);
  }

  // 2. Try Axios / REST response message
  const restData = error?.response?.data;
  if (restData) {
    if (typeof restData.message === 'string' && isSafeMessage(restData.message)) {
      return cleanMessage(restData.message);
    }
    if (Array.isArray(restData.message) && restData.message.length > 0) {
      const first = restData.message[0];
      if (typeof first === 'string' && isSafeMessage(first)) {
        return cleanMessage(first);
      }
    }
  }

  // 3. Try standard Error object message
  if (typeof error.message === 'string' && isSafeMessage(error.message)) {
    return cleanMessage(error.message);
  }

  return fallbackMessage;
}

function isSafeMessage(msg: string): boolean {
  if (!msg) return false;
  // Block internal code leaks, database errors, or stack traces
  const dangerousPatterns = [
    /Cannot/i,
    /TypeError/i,
    /SyntaxError/i,
    /ReferenceError/i,
    /Internal server/i,
    /PostgresError/i,
    /SQLSTATE/i,
    /relation ".*" does not exist/i,
    /column ".*" of relation/i,
    /violates foreign key/i,
    /duplicate key/i,
    /MongoError/i,
    /E11000/i,
    /class-validator/i,
    /at \w+\./i, // stack trace line
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(msg));
}

function cleanMessage(msg: string): string {
  // Remove "Bad Request Exception:" prefix if present
  let cleaned = msg.replace(/^Bad Request Exception:\s*/i, '');
  // Format camelCase or snake_case property names into readable words
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
