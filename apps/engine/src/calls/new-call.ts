import { CallStatus } from "@repo/types";
import type { Call, CleanCallRequest, Slot } from "@repo/types";

export function buildCall(
  callId: string,
  merchantId: string,
  request: CleanCallRequest,
  offeredSlots: Slot[],
  now: number,
): Call {
  const createdAt = new Date(now).toISOString();

  const call: Call = {
    id: callId,
    requestId: request.requestId,
    merchantId,
    orderRef: request.orderRef,
    status: CallStatus.QUEUED,
    outcome: null,
    context: {
      customerName: request.customer.name,
      customerPhone: request.customer.phone,
      customerLanguage: request.customer.language,
      driverName: request.driver ? request.driver.name : null,
      driverPhone: request.driver ? request.driver.phone : null,
      productName: request.product ? request.product.name : null,
      productSku: request.product?.sku ?? null,
      etaMinutes: request.etaMinutes,
      message: request.message,
      policy: request.policy,
    },
    offeredSlots,
    createdAt,
    startedAt: null,
    endedAt: null,
  };
  return call;
}
