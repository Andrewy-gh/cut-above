import Joi from 'joi';

const email = Joi.string()
  .email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net', 'org', 'edu'] },
  })
  .required();

const password = Joi.string()
  .pattern(
    new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=]).{8,}$/)
  )
  .required();

const firstName = Joi.string().allow('');

const lastName = Joi.string().allow('');

const id = Joi.string().guid().required();

const token = Joi.string().hex().length(64).required();

export const loginSchema = Joi.object({ email, password });

export const signupSchema = Joi.object({
  firstName,
  lastName,
  email,
  password,
});

export const emailSchema = Joi.object({ email });

export const passwordSchema = Joi.object({ password });

export const tokenUrlSchema = Joi.object({ id, token });
