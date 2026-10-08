const CALL_ROOM_PREFIX = "relay-call-";

export function callRoomName(callId: string): string {
  const roomName = `${CALL_ROOM_PREFIX}${callId}`;
  return roomName;
}

export function callIdFromRoomName(roomName: string): string | null {
  const isRelayRoom = roomName.startsWith(CALL_ROOM_PREFIX);
  if (!isRelayRoom) return null;
  const callId = roomName.slice(CALL_ROOM_PREFIX.length);
  return callId;
}
