import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("must be a valid email"));

export const signupSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  email: emailSchema,
  password: z.string().min(8, "must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "is required"),
});
