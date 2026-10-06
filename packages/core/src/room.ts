const CALL_ROOM_PREFIX = "relay-call-";

export function callRoomName(callAttemptId: string): string {
  return `${CALL_ROOM_PREFIX}${callAttemptId}`;
}

export function callAttemptIdFromRoomName(roomName: string): string | null {
  const isRelayRoom = roomName.startsWith(CALL_ROOM_PREFIX);
  if (!isRelayRoom) return null;
  const callAttemptId = roomName.slice(CALL_ROOM_PREFIX.length);
  return callAttemptId;
}
