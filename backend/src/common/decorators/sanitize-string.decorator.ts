import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export interface SanitizeStringOptions {
  maxLength?: number;
  minLength?: number;
  optional?: boolean;
  allowMultiline?: boolean;
  stripAllHtml?: boolean;
}

/**
 * Multi-pass HTML tag stripper that eliminates tags, nested evasion tags
 * (e.g. <<script>script>), and script protocols.
 */
export function stripHtmlTags(value: string): string {
  if (!value) return '';
  let prev = '';
  let curr = value;

  // Multi-pass loop prevents nested tag bypass attacks
  do {
    prev = curr;
    curr = curr.replace(/<[^>]*>?/gm, '');
  } while (curr !== prev);

  // Strip dangerous pseudo-protocols
  curr = curr.replace(/javascript\s*:/gi, '');
  curr = curr.replace(/vbscript\s*:/gi, '');
  curr = curr.replace(/data\s*:\s*text\/html/gi, '');

  return curr;
}

/**
 * Cleans string by stripping NULL bytes (\0), non-printable ASCII control chars,
 * and zero-width/bidi override characters.
 */
export function cleanRawString(
  value: string,
  options: { allowMultiline?: boolean; stripAllHtml?: boolean } = {},
): string {
  if (typeof value !== 'string') return value;

  // 1. Remove NULL bytes (\0) and invisible ASCII control characters (preserve \t, \n, \r if multiline)
  const controlRegex = options.allowMultiline
    ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
    : /[\x00-\x1F\x7F]/g;
  let cleaned = value.replace(controlRegex, '');

  // 2. Remove zero-width spaces, joiners, and RTL/LTR overrides
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');

  // 3. Strip HTML tags / script injection
  if (options.stripAllHtml !== false) {
    cleaned = stripHtmlTags(cleaned);
  }

  // 4. Whitespace handling
  if (!options.allowMultiline) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  } else {
    // Prevent excessive line break flooding (limit max consecutive newlines to 2)
    cleaned = cleaned.replace(/(\r\n|\n|\r){3,}/g, '\n\n');
  }

  return cleaned.trim();
}

/**
 * Decorator for DTO and GraphQL Input fields that:
 * 1. Validates that the input is a string (optional or required).
 * 2. Enforces minLength and maxLength limits.
 * 3. Transforms and cleanses the string:
 *    - Removes NULL bytes (\0) and non-printable ASCII control characters.
 *    - Removes zero-width spaces and bidirectional Unicode overrides.
 *    - Strips dangerous HTML tags and script injections.
 *    - Normalizes line breaks and whitespace.
 *    - Trims leading and trailing whitespace.
 */
export function SanitizeString(options: SanitizeStringOptions = {}) {
  const {
    maxLength = 5000,
    minLength,
    optional = false,
    allowMultiline = false,
    stripAllHtml = true,
  } = options;

  const decorators: PropertyDecorator[] = [];

  if (optional) {
    decorators.push(IsOptional());
  }
  decorators.push(IsString());

  if (minLength !== undefined) {
    decorators.push(
      MinLength(minLength, {
        message: `$property must be at least ${minLength} characters`,
      }),
    );
  }

  decorators.push(
    MaxLength(maxLength, {
      message: `$property cannot exceed ${maxLength} characters`,
    }),
  );

  decorators.push(
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      return cleanRawString(value, { allowMultiline, stripAllHtml });
    }),
  );

  return applyDecorators(...decorators);
}
