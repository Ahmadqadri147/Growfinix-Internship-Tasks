import { api } from "@/api/client";
import type { ApiResponse } from "@/types";
import type { User } from "@/types";

export interface AuthResult {
  user: User;
  token: string;
}

export const authService = {
  async register(input: { name: string; email: string; password: string }): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>("/auth/register", input);
    return data.data;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>("/auth/login", input);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.patch("/auth/change-password", input);
  }
};
