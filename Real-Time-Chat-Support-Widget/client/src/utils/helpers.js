const ADJECTIVES = ['Swift', 'Bright', 'Calm', 'Bold', 'Quiet', 'Clever', 'Gentle', 'Sunny'];
const ANIMALS = ['Otter', 'Falcon', 'Panda', 'Fox', 'Wolf', 'Heron', 'Lynx', 'Sparrow'];
const AVATAR_COLORS = ['6366F1', '8B5CF6', '10B981', 'F59E0B', 'F43F5E', '06B6D4', 'EC4899', '84CC16'];

/**
 * Creates a local guest identity as a fallback when the REST endpoint
 * that mints one isn't reachable. Keeps the widget usable offline-first.
 */
export function createLocalGuestIdentity() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(Math.random() * 90) + 10;
  const username = `${adjective} ${animal} #${suffix}`;
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const avatar = {
    url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(username)}&backgroundColor=${color}`,
    color: `#${color}`,
  };
  const id = `guest_${Math.random().toString(36).slice(2, 11)}`;
  return { id, username, avatar };
}

export function generateRoomId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Plays a short notification "pop" tone using the Web Audio API,
 * avoiding the need to ship an audio asset file.
 */
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.26);
    oscillator.onended = () => ctx.close();
  } catch {
    // Silently ignore environments without Web Audio support
  }
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard API unavailable'));
}

export function downloadChatExport(messages, roomId) {
  const lines = messages.map(
    (m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.sender.username}: ${m.text}`
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${roomId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default {
  createLocalGuestIdentity,
  generateRoomId,
  playNotificationSound,
  copyToClipboard,
  downloadChatExport,
};
