import * as v from 'valibot';

const firstName = v.optional(v.string(), '');

const lastName = v.optional(v.string(), '');

const email = v.pipe(
  v.string(),
  v.email()
);

const message = v.optional(v.string(), '');

export const newMessageSchema = v.object({
  contactDetails: v.object({
    firstName,
    lastName,
    email,
    message,
  }),
});

export const passwordResetSchema = v.object({
  email,
});

export type NewMessageInput = v.InferInput<typeof newMessageSchema>;
export type PasswordResetInput = v.InferInput<typeof passwordResetSchema>;
