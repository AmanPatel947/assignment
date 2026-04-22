const { z } = require('zod');

const statusEnum = z.enum(['todo', 'in_progress', 'done']);
const emptyToUndefined = (value) => (value === '' ? undefined : value);
const emptyToNull = (value) => (value === '' ? null : value);

const taskIdSchema = z.object({
  id: z.string().uuid(),
});

const createTaskSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.preprocess(
    emptyToNull,
    z.string().trim().max(500).nullable().optional(),
  ),
  status: statusEnum.optional(),
});

const updateTaskSchema = z
  .object({
    title: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(3).max(120).optional(),
    ),
    description: z.preprocess(
      emptyToNull,
      z.string().trim().max(500).nullable().optional(),
    ),
    status: statusEnum.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field is required',
  });

module.exports = { taskIdSchema, createTaskSchema, updateTaskSchema };
