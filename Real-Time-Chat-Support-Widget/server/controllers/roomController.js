import { generateGuestUsername, generateAvatar, generateRoomId } from '../utils/generateUser.js';

/**
 * Issues a fresh guest identity (username + avatar) for a new visitor.
 * The client calls this once and then persists it in localStorage.
 */
export function createGuestIdentity(req, res) {
  const username = generateGuestUsername();
  const avatar = generateAvatar(username);

  res.json({
    success: true,
    data: { username, avatar },
  });
}

/**
 * Issues a new random room ID, used when a visitor starts a fresh
 * support conversation without an existing room in localStorage.
 */
export function createRoom(req, res) {
  const roomId = generateRoomId();
  res.json({
    success: true,
    data: { roomId },
  });
}

export default { createGuestIdentity, createRoom };
