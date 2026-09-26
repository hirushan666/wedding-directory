export interface ClientSanitizeOptions {
  maxLength?: number;
  multiline?: boolean;
  stripHtml?: boolean;
}

/**
 * Sanitizes input text by:
 * - Removing NULL bytes (\0) and non-printable control characters
 * - Stripping zero-width spaces, joiners, and bidi override characters
 * - Stripping HTML tags if requested
 * - Normalizing line breaks and excessive whitespace
 * - Enforcing maximum length cutoff
 */
export function sanitizeInput(value: unknown, options: ClientSanitizeOptions = {}): string {
  if (typeof value !== 'string') return '';
  if (!value) return '';

  const {
    maxLength,
    multiline = false,
    stripHtml = true,
  } = options;

  // 1. Remove NULL bytes and invisible control characters (preserve tabs/newlines only if multiline)
  let cleaned = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Remove zero-width spaces, RTL/LTR overrides, byte order marks
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');

  // 3. Strip HTML tags if enabled
  if (stripHtml) {
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  }

  // 4. Whitespace handling
  if (!multiline) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  } else {
    // Preserve linebreaks but collapse excessive consecutive newlines to max 2
    cleaned = cleaned.replace(/(\r\n|\n|\r){3,}/g, '\n\n');
  }

  cleaned = cleaned.trim();

  // 5. Enforce max length
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned;
}
