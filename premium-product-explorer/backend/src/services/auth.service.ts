import bcrypt from "bcryptjs";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

const PUBLIC_USER = { id: true, name: true, email: true, role: true, avatar: true, createdAt: true };

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const hashed = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashed,
      role: "USER"
    },
    select: PUBLIC_USER
  });

  return { user, token: signToken({ sub: user.id, email: user.email, role: user.role }) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt
  };

  return { user: safeUser, token: signToken({ sub: user.id, email: user.email, role: user.role }) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER });
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw ApiError.badRequest("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
}
