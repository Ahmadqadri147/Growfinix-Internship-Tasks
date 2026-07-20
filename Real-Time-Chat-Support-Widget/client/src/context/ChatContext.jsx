import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import socket from '../utils/socket.js';

const AUTH_KEY = 'chatapp-auth';

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setStoredAuth(data) {
  if (data) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredAuth());
  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [typingUsers, setTypingUsers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);

  useEffect(() => {
    socket.connect();

    function handleConnect() {
      setConnectionStatus('connected');
      const stored = getStoredAuth();
      if (stored) {
        socket.emit('restore_session', { username: stored.username }, (response) => {
          if (response?.success) {
            setUser({ ...response.data, id: response.data.username });
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setStoredAuth(null);
          }
        });
      }
      socket.emit('get_my_rooms', (response) => {
        if (response?.success) setRooms(response.data);
      });
      socket.emit('get_rooms', (response) => {
        if (response?.success) setAllRooms(response.data);
      });
    }

    function handleDisconnect() {
      setConnectionStatus('disconnected');
    }

    function handleReconnectAttempt() {
      setConnectionStatus('reconnecting');
    }

    function handleReceiveMessage(message) {
      if (message.roomId === currentRoomRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    }

    function handleTyping({ user: typingUser }) {
      if (!typingUser || typingUser.username === userRef.current?.username) return;
      setTypingUsers((prev) =>
        prev.some((u) => u.username === typingUser.username) ? prev : [...prev, typingUser]
      );
    }

    function handleStopTyping({ user: typingUser }) {
      if (!typingUser) return;
      setTypingUsers((prev) => prev.filter((u) => u.username !== typingUser.username));
    }

    function handleOnlineCount(count) {
      setCurrentRoom((prev) => (prev ? { ...prev, memberCount: count } : prev));
    }

    function handleUserJoined({ user: joinedUser, memberCount }) {
      setCurrentRoom((prev) => (prev ? { ...prev, memberCount } : prev));
      setRoomMembers((prev) => {
        if (prev.some((m) => m.user?.username === joinedUser.username)) return prev;
        return [...prev, { socketId: 'unknown', user: joinedUser }];
      });
    }

    function handleUserLeft({ user: leftUser, memberCount }) {
      setCurrentRoom((prev) => (prev ? { ...prev, memberCount } : prev));
      setRoomMembers((prev) => prev.filter((m) => m.user?.username !== leftUser?.username));
    }

    function handleNewRoomAvailable(roomInfo) {
      setAllRooms((prev) => {
        if (prev.some((r) => r.roomId === roomInfo.roomId)) return prev;
        return [...prev, roomInfo];
      });
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.io.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('online_count', handleOnlineCount);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    socket.on('new_room_available', handleNewRoomAvailable);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('online_count', handleOnlineCount);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('new_room_available', handleNewRoomAvailable);
    };
  }, []);

  const currentRoomRef = useRef(currentRoomId);
  currentRoomRef.current = currentRoomId;
  const userRef = useRef(user);
  userRef.current = user;

  const login = useCallback((username, password) => {
    return new Promise((resolve, reject) => {
      socket.emit('login', { username, password }, (response) => {
        if (response?.success) {
          const userData = { ...response.data, id: response.data.username };
          setUser(userData);
          setIsAuthenticated(true);
          setStoredAuth(userData);
          resolve(userData);
        } else {
          reject(response?.message || 'Login failed');
        }
      });
    });
  }, []);

  const register = useCallback((username, password, avatar) => {
    return new Promise((resolve, reject) => {
      socket.emit('register', { username, password, avatar }, (response) => {
        if (response?.success) {
          const userData = { ...response.data, id: response.data.username };
          setUser(userData);
          setIsAuthenticated(true);
          setStoredAuth(userData);
          resolve(userData);
        } else {
          reject(response?.message || 'Registration failed');
        }
      });
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setStoredAuth(null);
    setRooms([]);
    setCurrentRoomId(null);
    setCurrentRoom(null);
    setMessages([]);
    setRoomMembers([]);
  }, []);

  const joinRoom = useCallback((roomId, password) => {
    return new Promise((resolve, reject) => {
      socket.emit('join_room', { roomId, password }, (response) => {
        if (response?.success) {
          setCurrentRoomId(roomId);
          setCurrentRoom({
            roomId: response.data.roomId,
            name: response.data.name,
            type: response.data.type,
            memberCount: response.data.memberCount,
          });
          setMessages(response.data.messages || []);
          setRoomMembers(response.data.members || []);
          setRooms((prev) => {
            const exists = prev.some((r) => r.roomId === roomId);
            if (!exists) {
              return [
                { roomId, name: response.data.name, type: response.data.type, memberCount: response.data.memberCount },
                ...prev,
              ];
            }
            return prev;
          });
          resolve(response.data);
        } else {
          reject(response?.message || 'Failed to join room');
        }
      });
    });
  }, []);

  const createRoom = useCallback(
    (name, password, type = 'public') => {
      return new Promise((resolve, reject) => {
        socket.emit('create_room', { name, type, password }, (response) => {
          if (response?.success) {
            joinRoom(response.data.roomId).then(resolve).catch(reject);
          } else {
            reject('Failed to create room');
          }
        });
      });
    },
    [joinRoom]
  );

  const leaveRoom = useCallback((roomId) => {
    return new Promise((resolve) => {
      socket.emit('leave_room', { roomId }, (response) => {
        if (response?.success) {
          setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
          if (currentRoomRef.current === roomId) {
            setCurrentRoomId(null);
            setCurrentRoom(null);
            setMessages([]);
            setRoomMembers([]);
          }
        }
        resolve();
      });
    });
  }, []);

  const switchRoom = useCallback(
    (roomId, password) => {
      if (currentRoomRef.current) {
        socket.emit('leave_room', { roomId: currentRoomRef.current });
      }
      return joinRoom(roomId, password);
    },
    [joinRoom]
  );

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !currentRoomRef.current) return;
    socket.emit('send_message', { roomId: currentRoomRef.current, text }, (response) => {
      if (!response?.success) {
        console.error('Failed to send message:', response?.message);
      }
    });
  }, []);

  const notifyTyping = useCallback(() => {
    if (currentRoomRef.current) {
      socket.emit('typing', { roomId: currentRoomRef.current });
    }
  }, []);

  const notifyStopTyping = useCallback(() => {
    if (currentRoomRef.current) {
      socket.emit('stop_typing', { roomId: currentRoomRef.current });
    }
  }, []);

  const refreshRooms = useCallback(() => {
    socket.emit('get_my_rooms', (response) => {
      if (response?.success) setRooms(response.data);
    });
    socket.emit('get_rooms', (response) => {
      if (response?.success) setAllRooms(response.data);
    });
  }, []);

  const value = {
    user,
    isAuthenticated,
    rooms,
    currentRoomId,
    currentRoom,
    messages,
    connectionStatus,
    typingUsers,
    allRooms,
    roomMembers,
    login,
    register,
    logout,
    joinRoom,
    createRoom,
    leaveRoom,
    switchRoom,
    sendMessage,
    notifyTyping,
    notifyStopTyping,
    refreshRooms,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
