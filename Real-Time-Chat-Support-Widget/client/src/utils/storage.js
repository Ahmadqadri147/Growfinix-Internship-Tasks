const KEYS = {
  ROOM_ID: 'chat-widget-room-id',
  USER: 'chat-widget-user',
  MESSAGES: (roomId) => `chat-widget-messages-${roomId}`,
  UNREAD: 'chat-widget-unread',
};

export function getStoredRoomId() {
  return localStorage.getItem(KEYS.ROOM_ID);
}

export function setStoredRoomId(roomId) {
  localStorage.setItem(KEYS.ROOM_ID, roomId);
}

export function getStoredUser() {
  const raw = localStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export function getStoredMessages(roomId) {
  const raw = localStorage.getItem(KEYS.MESSAGES(roomId));
  return raw ? JSON.parse(raw) : [];
}

export function setStoredMessages(roomId, messages) {
  // Cap what we persist so localStorage doesn't grow unbounded
  const trimmed = messages.slice(-200);
  localStorage.setItem(KEYS.MESSAGES(roomId), JSON.stringify(trimmed));
}

export function clearStoredMessages(roomId) {
  localStorage.removeItem(KEYS.MESSAGES(roomId));
}

export function getStoredUnread() {
  return Number(localStorage.getItem(KEYS.UNREAD) || 0);
}

export function setStoredUnread(count) {
  localStorage.setItem(KEYS.UNREAD, String(count));
}

export default {
  getStoredRoomId,
  setStoredRoomId,
  getStoredUser,
  setStoredUser,
  getStoredMessages,
  setStoredMessages,
  clearStoredMessages,
  getStoredUnread,
  setStoredUnread,
};
