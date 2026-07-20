const rooms = new Map();

export function createRoom(roomId, { type = 'public', name = 'New Room', password = null, createdBy = null, members = [] }) {
  const room = {
    type,
    name: name || 'New Room',
    password,
    createdBy,
    members: new Map(),
    messages: [],
    createdAt: new Date().toISOString(),
  };
  members.forEach((socketId) => room.members.set(socketId, null));
  rooms.set(roomId, room);
  return room;
}

export function verifyRoomPassword(roomId, password) {
  const room = rooms.get(roomId);
  if (!room) return false;
  if (!room.password) return true;
  return room.password === password;
}

export function isRoomCreator(roomId, socketId) {
  const room = rooms.get(roomId);
  return room ? room.createdBy === socketId : false;
}

export function setRoomPassword(roomId, password) {
  const room = rooms.get(roomId);
  if (room) room.password = password;
}

export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

export function roomExists(roomId) {
  return rooms.has(roomId);
}

export function addUserToRoom(roomId, socketId, user) {
  if (!rooms.has(roomId)) return null;
  const room = rooms.get(roomId);
  room.members.set(socketId, user);
  return room;
}

export function removeUserFromRoom(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.members.delete(socketId);
  return room;
}

export function getRoomUserCount(roomId) {
  const room = rooms.get(roomId);
  return room ? room.members.size : 0;
}

export function getRoomMembers(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.members.entries()).map(([sid, usr]) => ({ socketId: sid, user: usr }));
}

export function addMessageToRoom(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return [];
  room.messages.push(message);
  if (room.messages.length > 200) room.messages.shift();
  return room.messages;
}

export function getRoomMessages(roomId) {
  const room = rooms.get(roomId);
  return room ? room.messages : [];
}

export function getRoomInfo(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return {
    roomId,
    type: room.type,
    name: room.name,
    memberCount: room.members.size,
    createdAt: room.createdAt,
  };
}

export function getAllRooms() {
  const result = [];
  for (const [roomId, room] of rooms.entries()) {
    result.push({
      roomId,
      type: room.type,
      name: room.name,
      memberCount: room.members.size,
      createdAt: room.createdAt,
    });
  }
  return result;
}

export function getUserRooms(socketId) {
  const result = [];
  for (const [roomId, room] of rooms.entries()) {
    if (room.members.has(socketId)) {
      result.push({
        roomId,
        type: room.type,
        name: room.name,
        memberCount: room.members.size,
      });
    }
  }
  return result;
}

export function removeUserFromAllRooms(socketId) {
  const affectedRooms = [];
  for (const [roomId, room] of rooms.entries()) {
    if (room.members.has(socketId)) {
      room.members.delete(socketId);
      affectedRooms.push(roomId);
    }
  }
  return affectedRooms;
}

export function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.members.has(socketId)) {
      return roomId;
    }
  }
  return null;
}

export default {
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
  setRoomPassword,
};
