const users = new Map();

export function createUser(username, password, avatar) {
  if (!username || !password) return null;
  if (users.has(username)) return null;
  const user = {
    username,
    password,
    avatar: avatar || null,
    createdAt: new Date().toISOString(),
  };
  users.set(username, user);
  return { username: user.username, avatar: user.avatar };
}

export function authenticateUser(username, password) {
  if (!username || !password) return null;
  const user = users.get(username);
  if (!user || user.password !== password) return null;
  return { username: user.username, avatar: user.avatar };
}

export function getUser(username) {
  if (!username) return null;
  const user = users.get(username);
  if (!user) return null;
  return { username: user.username, avatar: user.avatar };
}

export default { createUser, authenticateUser, getUser };
