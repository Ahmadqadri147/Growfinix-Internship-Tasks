import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as brandService from "../services/brand.service";

export const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const brands = await brandService.getAllBrands();
  res.json(ApiResponse.ok(brands, "Brands fetched"));
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const brand = await brandService.getBrandBySlug(req.params.slug);
  res.json(ApiResponse.ok(brand, "Brand fetched"));
});
