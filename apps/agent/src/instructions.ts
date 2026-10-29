import type { AgentCall } from "./call-context.ts";

export function buildInstructions(call: AgentCall) {
  const deliveryLines: string[] = [];
  if (call.productName !== null) {
    deliveryLines.push(`The product being delivered: ${call.productName}.`);
  }
  deliveryLines.push(
    `The delivery is expected in about ${call.etaMinutes} minutes.`,
  );
  if (call.message !== null) {
    deliveryLines.push(`What the merchant told you: ${call.message}`);
  }

  const offeredLines = call.offeredSlots.map(
    (slot) => `- ${slot.label} (id: ${slot.id})`,
  );
  const offered = offeredLines.join("\n");
  const offeredIds = call.offeredSlots.map((slot) => slot.id).join(", ");

  const rules: string[] = [];
  rules.push(
    `- Greet ${call.customerName} by name, explain why you are calling in one short sentence, then offer the times.`,
  );
  rules.push(
    "- Ask one question at a time and wait for the answer. Keep every reply short and natural; this is a live call.",
  );
  rules.push(
    "- Do not invent any detail about the delivery beyond what you were told above.",
  );

  if (call.offeredSlots.length > 0) {
    rules.push(
      `- When the person picks a time, call the select_slot tool with exactly one of these ids: ${offeredIds}.`,
    );
    rules.push("- Never offer or accept a time that is not on that list.");
    rules.push(
      "- After you call select_slot, say you have noted the choice and they will get a confirmation. Then thank them and say goodbye.",
    );
  }

  if (call.policy.mayCancel) {
    rules.push(
      "- If the person asks to cancel, call the cancel tool. Do not promise the cancellation is done; say the merchant will handle it.",
    );
  } else {
    rules.push(
      "- You cannot cancel this delivery. If the person asks to cancel, offer to have a person call them back instead.",
    );
  }

  rules.push(
    "- If the person rejects every time you offer, or asks to speak to a person, call the request_human tool and say a person will follow up.",
  );

  const lines = [
    "You are Relay, a calm, friendly phone assistant calling about a delivery.",
    `You are speaking with ${call.customerName}.`,
    ...deliveryLines,
    ...(call.offeredSlots.length > 0
      ? ["The times you may offer:", offered]
      : ["You have no new times to offer on this call."]),
    "Rules:",
    ...rules,
  ];

  const instructions = lines.join("\n");
  return instructions;
}
