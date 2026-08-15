import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as categoryService from "../services/category.service";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(ApiResponse.ok(categories, "Categories fetched"));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryBySlug(req.params.slug);
  res.json(ApiResponse.ok(category, "Category fetched"));
});
