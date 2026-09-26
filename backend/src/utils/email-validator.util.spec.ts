import { isValidEmail, normalizeEmail, MAX_EMAIL_LENGTH } from './email-validator.util';

describe('email-validator.util', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('first.last@sub.domain.lk')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain..com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('rejects emails exceeding MAX_EMAIL_LENGTH', () => {
      const longLocal = 'a'.repeat(250);
      expect(isValidEmail(`${longLocal}@example.com`)).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    it('trims and converts to lowercase', () => {
      expect(normalizeEmail('  User.Name@Example.COM  ')).toBe('user.name@example.com');
    });

    it('handles empty inputs', () => {
      expect(normalizeEmail('')).toBe('');
      expect(normalizeEmail(undefined as unknown as string)).toBe('');
    });
  });
});
