import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as orderService from "../services/order.service";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.userId!, req.body);
  res.status(201).json(ApiResponse.ok(order, "Order created"));
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const result = await orderService.getOrders(req.userId!, page, limit);
  res.json(ApiResponse.ok(result, "Orders fetched"));
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.userId!, req.params.id, req.role ?? "USER");
  res.json(ApiResponse.ok(order, "Order fetched"));
});
