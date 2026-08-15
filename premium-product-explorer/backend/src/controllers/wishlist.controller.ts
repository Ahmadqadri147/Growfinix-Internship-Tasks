import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as wishlistService from "../services/wishlist.service";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 12);
  const result = await wishlistService.getWishlist(req.userId!, page, limit);
  res.json(ApiResponse.ok(result, "Wishlist fetched"));
});

export const add = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.addToWishlist(req.userId!, req.params.productId);
  res.status(201).json(ApiResponse.ok(result, result.added ? "Added to wishlist" : "Already in wishlist"));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await wishlistService.removeFromWishlist(req.userId!, req.params.productId);
  res.json(ApiResponse.ok(result, "Removed from wishlist"));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  const wishlisted = await wishlistService.isWishlisted(req.userId!, req.params.productId);
  res.json(ApiResponse.ok({ wishlisted }, "Wishlist status fetched"));
});
