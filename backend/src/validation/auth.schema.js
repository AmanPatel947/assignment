const { z } = require('zod');

const emailSchema = z
  .string()
  .trim()
  .email()
  .transform((value) => value.toLowerCase());

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(72),
  name: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(2).max(80).optional(),
  ),
  role: z.enum(['user', 'admin']).optional(),
  adminSecret: z.preprocess(emptyToUndefined, z.string().min(6).optional()),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(72),
});

module.exports = { registerSchema, loginSchema };
