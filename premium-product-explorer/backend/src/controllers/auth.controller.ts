import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as authService from "../services/auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(ApiResponse.ok(result, "Account created successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json(ApiResponse.ok(result, "Logged in successfully"));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.userId!);
  res.json(ApiResponse.ok(user, "User fetched"));
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.userId!, req.body.currentPassword, req.body.newPassword);
  res.json(ApiResponse.ok({ changed: true }, "Password changed successfully"));
});
