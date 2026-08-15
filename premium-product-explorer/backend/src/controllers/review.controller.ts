import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as reviewService from "../services/review.service";

export const getByProduct = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  const sort = String(req.query.sort ?? "newest");
  const result = await reviewService.getProductReviews(req.params.productId, page, limit, sort);
  res.json(ApiResponse.ok(result, "Reviews fetched"));
});

export const getBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const breakdown = await reviewService.getRatingBreakdown(req.params.productId);
  res.json(ApiResponse.ok(breakdown, "Rating breakdown fetched"));
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.createReview(req.userId!, req.params.productId, req.body);
  res.status(201).json(ApiResponse.ok(review, "Review created"));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.userId!, req.params.id, req.role ?? "USER");
  res.json(ApiResponse.ok({ deleted: true }, "Review deleted"));
});

export const helpful = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.markHelpful(req.userId!, req.params.id);
  res.json(ApiResponse.ok(review, "Marked as helpful"));
});
