import { z } from "zod";
import { InvalidInputError } from "@repo/core";
import type { LoginRequest, SignupRequest } from "@repo/types";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("must be a valid email"));

const signupSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  email: emailSchema,
  password: z.string().min(8, "must be at least 8 characters"),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "is required"),
});

function firstMessage(error: z.ZodError, prefix: string): string {
  const issue = error.issues[0];
  if (issue === undefined) return `${prefix} is invalid`;
  const path = issue.path.join(".");
  return path === "" ? issue.message : `${prefix}.${path} ${issue.message}`;
}

export function cleanSignup(raw: unknown): SignupRequest {
  const result = signupSchema.safeParse(raw);
  if (!result.success) {
    throw new InvalidInputError(firstMessage(result.error, "signup"));
  }
  return result.data;
}

export function cleanLogin(raw: unknown): LoginRequest {
  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    throw new InvalidInputError(firstMessage(result.error, "login"));
  }
  return result.data;
}
