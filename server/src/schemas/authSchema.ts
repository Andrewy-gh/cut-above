import * as v from 'valibot';

const email = v.pipe(
  v.string(),
  v.email(),
  v.check(
    (value) => {
      const allowedTLDs = ['.com', '.net', '.org', '.edu'];
      return allowedTLDs.some(tld => value.endsWith(tld));
    },
    'Email domain must end with .com, .net, .org, or .edu'
  )
);

const password = v.pipe(
  v.string(),
  v.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=]).{8,}$/,
    'Password must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character'
  )
);

const firstName = v.optional(v.string(), '');

const lastName = v.optional(v.string(), '');

const id = v.pipe(
  v.string(),
  v.uuid('ID must be a valid UUID')
);

const token = v.pipe(
  v.string(),
  v.length(64, 'Token must be exactly 64 characters'),
  v.check(
    (value) => /^[0-9a-fA-F]+$/.test(value),
    'Token must be a hexadecimal string'
  )
);

export const loginSchema = v.object({
  email,
  password,
});

export const signupSchema = v.object({
  firstName,
  lastName,
  email,
  password,
});

export const emailSchema = v.object({
  email,
});

export const passwordSchema = v.object({
  password,
});

export const tokenUrlSchema = v.object({
  id,
  token,
});

export type LoginInput = v.InferInput<typeof loginSchema>;
export type SignupInput = v.InferInput<typeof signupSchema>;
export type EmailInput = v.InferInput<typeof emailSchema>;
export type PasswordInput = v.InferInput<typeof passwordSchema>;
export type TokenUrlInput = v.InferInput<typeof tokenUrlSchema>;
