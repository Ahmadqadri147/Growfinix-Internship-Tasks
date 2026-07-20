import { nanoid } from 'nanoid';

const AVATAR_COLORS = [
  '6366F1', '8B5CF6', '10B981', 'F59E0B',
  'F43F5E', '06B6D4', 'EC4899', '84CC16',
];

const ADJECTIVES = ['Swift', 'Bright', 'Calm', 'Bold', 'Quiet', 'Clever', 'Gentle', 'Sunny'];
const ANIMALS = ['Otter', 'Falcon', 'Panda', 'Fox', 'Wolf', 'Heron', 'Lynx', 'Sparrow'];

/**
 * Generates a random, human-friendly guest username, e.g. "Swift Otter #42".
 */
export function generateGuestUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 90) + 10;
  return `${adjective} ${animal} #${suffix}`;
}

/**
 * Generates a deterministic-looking avatar URL (DiceBear) seeded by username,
 * along with a matching accent color for the UI.
 */
export function generateAvatar(seed) {
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return {
    url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${color}`,
    color: `#${color}`,
  };
}

export function generateId() {
  return nanoid(10);
}

export function generateRoomId() {
  return nanoid(8);
}

export default { generateGuestUsername, generateAvatar, generateId, generateRoomId };
