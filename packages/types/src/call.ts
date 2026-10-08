import type { Slot } from "./slot.ts";

export const CallStatus = {
  QUEUED: "QUEUED",
  CALLING: "CALLING",
  ENDED: "ENDED",
} as const;

export type CallStatus = (typeof CallStatus)[keyof typeof CallStatus];

export const CallOutcome = {
  RESCHEDULED: "RESCHEDULED",
  CANCELLATION_REQUESTED: "CANCELLATION_REQUESTED",
  HUMAN_REQUESTED: "HUMAN_REQUESTED",
  NO_DECISION: "NO_DECISION",
  NO_ANSWER: "NO_ANSWER",
  FAILED: "FAILED",
} as const;

export type CallOutcome = (typeof CallOutcome)[keyof typeof CallOutcome];

export interface Person {
  name: string;
  phone: string;
}

export interface Product {
  name: string;
  sku?: string;
}

export interface RescheduleWindow {
  days: string[];
  from: string;
  to: string;
}

export interface CallPolicy {
  mayCancel: boolean;
  mayReschedule: boolean;
  rescheduleWindow?: RescheduleWindow;
}

export interface IncomingCallRequest {
  requestId?: unknown;
  orderRef?: unknown;
  customer?: unknown;
  driver?: unknown;
  product?: unknown;
  etaMinutes?: unknown;
  message?: unknown;
  policy?: unknown;
}

export interface CallCustomer extends Person {
  language: string;
}

export interface CleanCallRequest {
  requestId: string;
  orderRef: string;
  customer: CallCustomer;
  driver: Person | null;
  product: Product | null;
  etaMinutes: number;
  message: string | null;
  policy: CallPolicy;
}

export interface CallContext {
  customerName: string;
  customerPhone: string;
  customerLanguage: string;
  driverName: string | null;
  driverPhone: string | null;
  productName: string | null;
  productSku: string | null;
  etaMinutes: number;
  message: string | null;
  policy: CallPolicy;
}

export interface Call {
  id: string;
  requestId: string;
  merchantId: string;
  orderRef: string;
  status: CallStatus;
  outcome: CallOutcome | null;
  context: CallContext;
  offeredSlots: Slot[];
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface CallRow {
  id: string;
  requestId: string;
  merchantId: string;
  orderRef: string;
  status: CallStatus;
  outcome: CallOutcome | null;
  customerName: string;
  customerPhone: string;
  customerLanguage: string;
  driverName: string | null;
  driverPhone: string | null;
  productName: string | null;
  productSku: string | null;
  etaMinutes: number;
  message: string | null;
  policy: unknown;
  offeredSlots: unknown;
  createdAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface CallSession {
  url: string;
  token: string;
  roomName: string;
}

export interface TranscriptTurnView {
  speaker: "AGENT" | "CALLER";
  text: string;
  spokenAt: string;
}

export interface CallView {
  id: string;
  orderRef: string;
  customerName: string;
  status: CallStatus;
  outcome: CallOutcome | null;
  offeredSlots: Slot[];
  transcripts: TranscriptTurnView[];
  createdAt: string;
  endedAt: string | null;
}
