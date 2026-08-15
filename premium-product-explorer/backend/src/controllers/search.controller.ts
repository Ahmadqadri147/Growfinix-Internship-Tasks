import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as searchService from "../services/search.service";

export const recordSearch = asyncHandler(async (req: Request, res: Response) => {
  const { query, resultsCount } = req.body;
  await searchService.recordSearch(query, resultsCount ?? 0, req.userId);
  res.status(201).json(ApiResponse.ok({ recorded: true }, "Search recorded"));
});

export const trending = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 7);
  const limit = Number(req.query.limit ?? 10);
  const searches = await searchService.getTrendingSearches(days, limit);
  res.json(ApiResponse.ok(searches, "Trending searches fetched"));
});

export const recent = asyncHandler(async (req: Request, res: Response) => {
  const searches = await searchService.getRecentSearches(req.userId);
  res.json(ApiResponse.ok(searches, "Recent searches fetched"));
});

export const clear = asyncHandler(async (req: Request, res: Response) => {
  const result = await searchService.clearSearchHistory(req.userId);
  res.json(ApiResponse.ok(result, "Search history cleared"));
});
