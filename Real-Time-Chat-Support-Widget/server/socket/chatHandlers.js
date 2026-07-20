import {
  createRoom,
  getRoom,
  roomExists,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUserCount,
  getRoomMembers,
  addMessageToRoom,
  getRoomMessages,
  getRoomInfo,
  getAllRooms,
  getUserRooms,
  removeUserFromAllRooms,
  findRoomBySocketId,
  verifyRoomPassword,
  isRoomCreator,
} from '../utils/roomStore.js';
import { createUser, authenticateUser, getUser } from '../utils/authStore.js';
import { generateId } from '../utils/generateUser.js';

const typingTimeouts = new Map();
const MESSAGE_LIMIT = 20;
const MESSAGE_WINDOW_MS = 10000;
const messageTimestamps = new Map();

function isRateLimited(socketId) {
  const now = Date.now();
  const hits = messageTimestamps.get(socketId) || [];
  const recent = hits.filter((t) => now - t < MESSAGE_WINDOW_MS);
  recent.push(now);
  messageTimestamps.set(socketId, recent);
  return recent.length > MESSAGE_LIMIT;
}

function clearRateLimit(socketId) {
  messageTimestamps.delete(socketId);
}

export function registerChatHandlers(io, socket) {
  socket.data.currentRoomId = null;

  socket.on('register', ({ username, password, avatar } = {}, ack) => {
    if (!username?.trim() || !password?.trim()) {
      return ack?.({ success: false, message: 'Username and password required' });
    }
    if (username.length < 3 || username.length > 20) {
      return ack?.({ success: false, message: 'Username must be 3-20 characters' });
    }
    if (password.length < 4) {
      return ack?.({ success: false, message: 'Password must be at least 4 characters' });
    }

    const result = createUser(username.trim(), password, avatar || null);
    if (!result) {
      return ack?.({ success: false, message: 'Username already taken' });
    }

    socket.data.user = result;
    ack?.({ success: true, data: result });
  });

  socket.on('login', ({ username, password } = {}, ack) => {
    if (!username?.trim() || !password?.trim()) {
      return ack?.({ success: false, message: 'Username and password required' });
    }

    const result = authenticateUser(username.trim(), password);
    if (!result) {
      return ack?.({ success: false, message: 'Invalid username or password' });
    }

    socket.data.user = result;
    ack?.({ success: true, data: result });
  });

  socket.on('restore_session', ({ username } = {}, ack) => {
    if (!username) return ack?.({ success: false });
    const result = getUser(username);
    if (result) {
      socket.data.user = result;
      ack?.({ success: true, data: result });
    } else {
      ack?.({ success: false });
    }
  });

  socket.on('create_room', ({ name, type = 'public', password } = {}, ack) => {
    const roomId = generateId();

    createRoom(roomId, {
      type,
      name: name?.trim() || 'New Room',
      password: password?.trim() || null,
      createdBy: socket.id,
      members: [socket.id],
    });

    socket.join(roomId);
    socket.data.currentRoomId = roomId;

    const info = getRoomInfo(roomId);
    ack?.({ success: true, data: info });
    socket.broadcast.emit('new_room_available', info);
  });

  socket.on('join_room', ({ roomId, password } = {}, ack) => {
    if (typeof roomId !== 'string' || !roomId.trim()) {
      return ack?.({ success: false, message: 'Valid roomId required' });
    }

    if (!roomExists(roomId)) {
      return ack?.({ success: false, message: 'Room not found. Check the room code.' });
    }

    const isCreator = isRoomCreator(roomId, socket.id);
    if (!isCreator && !verifyRoomPassword(roomId, password)) {
      return ack?.({ success: false, message: 'Incorrect room password' });
    }

    const user = socket.data.user;
    if (!user) {
      return ack?.({ success: false, message: 'Please login first' });
    }

    if (socket.data.currentRoomId) {
      socket.leave(socket.data.currentRoomId);
    }

    socket.join(roomId);
    socket.data.currentRoomId = roomId;

    addUserToRoom(roomId, socket.id, user);

    const info = getRoomInfo(roomId);
    const messages = getRoomMessages(roomId);
    const members = getRoomMembers(roomId);

    ack?.({
      success: true,
      data: { ...info, messages, members },
    });

    socket.to(roomId).emit('user_joined', {
      user,
      memberCount: info.memberCount,
    });

    io.to(roomId).emit('online_count', info.memberCount);
  });

  socket.on('leave_room', ({ roomId } = {}, ack) => {
    if (!roomId) return ack?.({ success: false, message: 'roomId required' });

    socket.leave(roomId);
    removeUserFromRoom(roomId, socket.id);

    if (socket.data.currentRoomId === roomId) {
      socket.data.currentRoomId = null;
    }

    const count = getRoomUserCount(roomId);

    socket.to(roomId).emit('user_left', {
      user: socket.data.user,
      memberCount: count,
    });
    io.to(roomId).emit('online_count', count);

    ack?.({ success: true });
  });

  socket.on('get_rooms', (_, ack) => {
    const rooms = getAllRooms().filter((r) => r.type !== 'direct');
    ack?.({ success: true, data: rooms });
  });

  socket.on('get_my_rooms', (_, ack) => {
    const rooms = getUserRooms(socket.id);
    ack?.({ success: true, data: rooms });
  });

  socket.on('get_room_info', ({ roomId } = {}, ack) => {
    if (!roomId) return ack?.({ success: false });
    const info = getRoomInfo(roomId);
    const members = getRoomMembers(roomId);
    ack?.({ success: true, data: { ...info, members } });
  });

  socket.on('send_message', (payload, ack) => {
    const { roomId, text } = payload || {};
    const sender = socket.data.user;

    if (!sender) {
      return ack?.({ success: false, message: 'Join a room first' });
    }
    if (!roomId || !roomExists(roomId)) {
      return ack?.({ success: false, message: 'Invalid room' });
    }
    if (typeof text !== 'string' || !text.trim()) {
      return ack?.({ success: false, message: 'Invalid message' });
    }
    if (isRateLimited(socket.id)) {
      return ack?.({ success: false, message: 'Too many messages, slow down' });
    }

    const message = {
      id: generateId(),
      text: text.trim().slice(0, 2000),
      sender,
      roomId,
      timestamp: new Date().toISOString(),
    };

    addMessageToRoom(roomId, message);
    io.to(roomId).emit('receive_message', message);
    ack?.({ success: true, message });
  });

  socket.on('typing', ({ roomId } = {}) => {
    const sender = socket.data.user;
    if (!roomId || !sender) return;
    socket.to(roomId).emit('typing', { user: sender });

    const key = `${roomId}:${socket.id}`;
    if (typingTimeouts.has(key)) clearTimeout(typingTimeouts.get(key));
    const timeout = setTimeout(() => {
      socket.to(roomId).emit('stop_typing', { user: sender });
      typingTimeouts.delete(key);
    }, 3000);
    typingTimeouts.set(key, timeout);
  });

  socket.on('stop_typing', ({ roomId } = {}) => {
    const sender = socket.data.user;
    if (!roomId || !sender) return;
    const key = `${roomId}:${socket.id}`;
    if (typingTimeouts.has(key)) {
      clearTimeout(typingTimeouts.get(key));
      typingTimeouts.delete(key);
    }
    socket.to(roomId).emit('stop_typing', { user: sender });
  });

  socket.on('disconnect', () => {
    clearRateLimit(socket.id);

    const affectedRooms = removeUserFromAllRooms(socket.id);
    affectedRooms.forEach((roomId) => {
      const count = getRoomUserCount(roomId);
      socket.to(roomId).emit('user_left', {
        user: socket.data.user,
        memberCount: count,
      });
      io.to(roomId).emit('online_count', count);
    });

    for (const [key, timeout] of typingTimeouts.entries()) {
      if (key.endsWith(`:${socket.id}`)) {
        clearTimeout(timeout);
        typingTimeouts.delete(key);
      }
    }
  });
}

export default registerChatHandlers;
