import client from "./client";
import type { AuthResponse, LoginCredentials, RegisterData, User } from "@/types";

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await client.post<{ success: boolean; data: AuthResponse }>("/auth/login", credentials);
  return data.data;
}

export async function register(registerData: RegisterData): Promise<AuthResponse> {
  const { data: response } = await client.post<{ success: boolean; data: AuthResponse }>("/auth/register", registerData);
  return response.data;
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<{ success: boolean; data: User }>("/auth/me");
  return data.data;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const { data: response } = await client.patch<{ success: boolean; data: User }>("/auth/profile", data);
  return response.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await client.post<{ message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { data } = await client.post<{ message: string }>("/auth/reset-password", {
    token,
    password,
  });
  return data;
}
