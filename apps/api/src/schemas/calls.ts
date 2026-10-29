import { z } from "zod";

const personSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  phone: z.string().trim().min(1, "is required"),
});

const slotTimeSchema = z.iso
  .datetime({ offset: true, error: "must be a date and time" })
  .refine(
    (value) => new Date(value).getTime() > Date.now(),
    "must be in the future",
  );

const policySchema = z.object({
  mayCancel: z.boolean().default(false),
  mayReschedule: z.boolean().default(false),
  slots: z.array(slotTimeSchema).max(5, "must be 5 or fewer").default([]),
});

export const callRequestSchema = z
  .object({
    requestId: z.string().trim().min(1, "is required"),
    orderRef: z.string().trim().min(1, "is required"),
    customer: personSchema.extend({
      language: z
        .string()
        .trim()
        .min(1)
        .nullish()
        .transform((value) => value ?? "en"),
    }),
    driver: personSchema.nullish(),
    product: z
      .object({
        name: z.string().trim().min(1, "is required"),
        sku: z.string().trim().min(1, "is required").optional(),
      })
      .nullish(),
    etaMinutes: z
      .number()
      .int("must be whole minutes")
      .positive("must be greater than zero"),
    message: z.string().trim().min(1, "is required").nullish(),
    policy: policySchema.default({
      mayCancel: false,
      mayReschedule: false,
      slots: [],
    }),
  })
  .refine(
    (request) =>
      !request.policy.mayReschedule || request.policy.slots.length > 0,
    {
      path: ["policy", "slots"],
      message: "needs at least one time when mayReschedule is true",
    },
  );
