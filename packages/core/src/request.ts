import { z } from "zod";
import {
  type CallPolicy,
  type CleanCallRequest,
  type IncomingCallRequest,
} from "@repo/types";
import { InvalidInputError } from "./errors.ts";

const personSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  phone: z.string().trim().min(1, "is required"),
});

const customerSchema = personSchema.extend({
  language: z
    .string()
    .trim()
    .min(1, "is required")
    .nullish()
    .transform((value) => value ?? "en"),
});

const productSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  sku: z.string().trim().min(1, "is required").optional(),
});

const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

const windowSchema = z.object({
  days: z
    .array(z.string().regex(dayPattern, "must look like 2026-10-08"))
    .min(1, "must not be empty"),
  from: z.string().regex(timePattern, "must look like 09:00"),
  to: z.string().regex(timePattern, "must look like 18:00"),
});

const policySchema = z.object({
  mayCancel: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
  mayReschedule: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
  rescheduleWindow: windowSchema.optional(),
});

const callRequestSchema = z
  .object({
    requestId: z.string().trim().min(1, "is required"),
    orderRef: z.string().trim().min(1, "is required"),
    customer: customerSchema,
    driver: personSchema.nullish(),
    product: productSchema.nullish(),
    etaMinutes: z
      .number()
      .refine(
        (value) => Number.isInteger(value) && value > 0,
        "must be a whole number of minutes greater than zero",
      ),
    message: z.string().trim().min(1, "is required").nullish(),
    policy: policySchema
      .nullish()
      .transform(
        (value) => value ?? { mayCancel: false, mayReschedule: false },
      ),
  })
  .superRefine((request, ctx) => {
    const needsWindow =
      request.policy.mayReschedule && !request.policy.rescheduleWindow;
    if (needsWindow) {
      ctx.addIssue({
        code: "custom",
        path: ["policy", "rescheduleWindow"],
        message: "is required when mayReschedule is true",
      });
    }
  });

export function cleanCallRequest(raw: IncomingCallRequest): CleanCallRequest {
  const result = callRequestSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (issue === undefined) {
      throw new InvalidInputError("request is invalid");
    }
    const path = issue.path.join(".");
    const message =
      path === "" ? issue.message : `request.${path} ${issue.message}`;
    throw new InvalidInputError(message);
  }

  const parsed = result.data;
  const policy: CallPolicy = parsed.policy;

  const request: CleanCallRequest = {
    requestId: parsed.requestId,
    orderRef: parsed.orderRef,
    customer: parsed.customer,
    driver: parsed.driver ?? null,
    product: parsed.product ?? null,
    etaMinutes: parsed.etaMinutes,
    message: parsed.message ?? null,
    policy,
  };
  return request;
}
