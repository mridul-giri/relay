import { CallPersona, type CallBrief } from "@repo/types";

export function buildInstructions(brief: CallBrief): string {
  const person =
    brief.attempt.persona === CallPersona.DRIVER
      ? brief.trip.driver
      : brief.trip.customer;

  const lateBy = brief.trip.etaMinutes - brief.trip.plannedEtaMinutes;

  const offeredLines = brief.attempt.slots.map(
    (slot) => `- ${slot.label} (id: ${slot.id})`,
  );
  const offered = offeredLines.join("\n");

  const slotIds = brief.attempt.slots.map((slot) => slot.id);
  const allowedIds = slotIds.join(", ");

  const reasonLine =
    brief.trip.delayReason === null
      ? null
      : `The reported reason for the delay: ${brief.trip.delayReason}.`;

  const detailsRule =
    brief.trip.delayReason === null
      ? "- Do not make up any detail about the delivery beyond the delay you were told."
      : `- If asked, you may share the delay reason above and the driver's name (${brief.trip.driver.name}). Do not invent anything else about the delivery.`;

  const instructionLines = [
    "You are Relay, a calm, friendly phone assistant calling about a delivery.",
    `You are speaking with ${person.name}.`,
    `Why you are calling: the delivery is running about ${lateBy} minutes late.`,
    ...(reasonLine === null ? [] : [reasonLine]),
    "The times you may offer:",
    offered,
    "Rules:",
    `- Greet ${person.name} by name, explain the delay in one short sentence, then offer the three times.`,
    "- Ask one question at a time and wait for the answer. Keep every reply short and natural; this is a live call.",
    `- When the person picks a time, call the select_slot tool with exactly one of these ids: ${allowedIds}.`,
    "- Never invent a time that is not on that list, and never accept a time the person names that is not offered.",
    "- After you call select_slot, say that you have noted the choice and they will get a confirmation. Do not promise the time is locked until then.",
    "- Thank them and say goodbye once their choice is recorded.",
    detailsRule,
  ];
  const instructions = instructionLines.join("\n");
  return instructions;
}
