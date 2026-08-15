import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as statsService from "../services/stats.service";
import * as productService from "../services/product.service";

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await statsService.getDashboardStats();
  res.json(ApiResponse.ok(stats, "Dashboard stats fetched"));
});

export const topSearches = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 30);
  const limit = Number(req.query.limit ?? 10);
  const searches = await statsService.getTopSearches(days, limit);
  res.json(ApiResponse.ok(searches, "Top searches fetched"));
});

export const searchVolume = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 14);
  const volume = await statsService.getSearchVolume(days);
  res.json(ApiResponse.ok(volume, "Search volume fetched"));
});

export const revenueByDay = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 14);
  const revenue = await statsService.getRevenueByDay(days);
  res.json(ApiResponse.ok(revenue, "Revenue fetched"));
});

export const mostViewed = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 10);
  const products = await statsService.getMostViewedProducts(limit);
  res.json(ApiResponse.ok(products, "Most viewed products fetched"));
});

export const recentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 12);
  const activities = await statsService.getRecentActivity(limit);
  res.json(ApiResponse.ok(activities, "Recent activity fetched"));
});

export const categoryDistribution = asyncHandler(async (_req: Request, res: Response) => {
  const distribution = await statsService.getCategoryDistribution();
  res.json(ApiResponse.ok(distribution, "Category distribution fetched"));
});

export const adminProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);
  res.json(ApiResponse.ok(result, "Products fetched"));
});
