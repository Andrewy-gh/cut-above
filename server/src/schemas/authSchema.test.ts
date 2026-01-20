import { describe, it, expect } from 'vitest';
import * as v from 'valibot';
import { loginSchema, signupSchema, tokenUrlSchema, emailSchema, passwordSchema } from './authSchema.js';

describe('authSchema - validation', () => {
  describe('email validation', () => {
    it('accepts valid emails with allowed TLDs', () => {
      const validEmails = [
        'test@example.com',
        'user@domain.net',
        'admin@site.org',
        'student@university.edu',
      ];

      validEmails.forEach(email => {
        const result = v.safeParse(emailSchema, { email });
        expect(result.success).toBe(true);
      });
    });

    it('rejects emails with disallowed TLDs', () => {
      const invalidEmails = [
        'test@example.co.uk',
        'user@domain.io',
        'admin@site.dev',
      ];

      invalidEmails.forEach(email => {
        const result = v.safeParse(emailSchema, { email });
        expect(result.success).toBe(false);
      });
    });

    it('rejects invalid email format', () => {
      const result = v.safeParse(emailSchema, { email: 'notanemail' });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('accepts valid password with all requirements', () => {
      const validPasswords = [
        'Password1!',
        'MyP@ssw0rd',
        'Str0ng#Pass',
        'C0mpl3x!Password',
      ];

      validPasswords.forEach(password => {
        const result = v.safeParse(passwordSchema, { password });
        expect(result.success).toBe(true);
      });
    });

    it('rejects password without uppercase', () => {
      const result = v.safeParse(passwordSchema, { password: 'password1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('uppercase');
      }
    });

    it('rejects password without lowercase', () => {
      const result = v.safeParse(passwordSchema, { password: 'PASSWORD1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('lowercase');
      }
    });

    it('rejects password without digit', () => {
      const result = v.safeParse(passwordSchema, { password: 'Password!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('digit');
      }
    });

    it('rejects password without special character', () => {
      const result = v.safeParse(passwordSchema, { password: 'Password1' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('special character');
      }
    });

    it('rejects password less than 8 characters', () => {
      const result = v.safeParse(passwordSchema, { password: 'Pass1!' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('8 characters');
      }
    });
  });

  describe('token validation', () => {
    it('accepts valid 64-character hexadecimal token', () => {
      const validTokens = [
        'a'.repeat(64),
        '0123456789abcdefABCDEF'.repeat(2) + '01234567890123456789ab',
        'F'.repeat(64),
        '0'.repeat(64),
      ];

      validTokens.forEach(token => {
        const result = v.safeParse(tokenUrlSchema, {
          id: '123e4567-e89b-12d3-a456-426614174000',
          token,
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects token with non-hexadecimal characters', () => {
      const result = v.safeParse(tokenUrlSchema, {
        id: '123e4567-e89b-12d3-a456-426614174000',
        token: 'g'.repeat(64), // 'g' is not valid hex
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('hexadecimal');
      }
    });

    it('rejects token with wrong length (too short)', () => {
      const result = v.safeParse(tokenUrlSchema, {
        id: '123e4567-e89b-12d3-a456-426614174000',
        token: 'a'.repeat(63),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('64 characters');
      }
    });

    it('rejects token with wrong length (too long)', () => {
      const result = v.safeParse(tokenUrlSchema, {
        id: '123e4567-e89b-12d3-a456-426614174000',
        token: 'a'.repeat(65),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues[0].message).toContain('64 characters');
      }
    });

    it('rejects token with special characters', () => {
      const result = v.safeParse(tokenUrlSchema, {
        id: '123e4567-e89b-12d3-a456-426614174000',
        token: '@'.repeat(64),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login credentials', () => {
      const result = v.safeParse(loginSchema, {
        email: 'user@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid login with bad email', () => {
      const result = v.safeParse(loginSchema, {
        email: 'invalid',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('accepts valid signup with optional names', () => {
      const result = v.safeParse(signupSchema, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });

    it('accepts signup without optional names', () => {
      const result = v.safeParse(signupSchema, {
        email: 'user@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });
  });
});
