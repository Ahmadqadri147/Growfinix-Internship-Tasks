import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as productService from "../services/product.service";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getProducts(req.query);
  res.json(ApiResponse.ok(result, "Products fetched"));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.json(ApiResponse.ok(product, "Product fetched"));
});

export const getRelated = asyncHandler(async (req: Request, res: Response) => {
  const { id, categoryId } = req.params;
  const products = await productService.getRelatedProducts(id, categoryId);
  res.json(ApiResponse.ok(products, "Related products fetched"));
});

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "");
  const suggestions = await productService.getSuggestions(q);
  res.set("Cache-Control", "public, max-age=45");
  res.json(ApiResponse.ok(suggestions, "Suggestions fetched"));
});

export const getFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getFeaturedProducts();
  res.json(ApiResponse.ok(products, "Featured products fetched"));
});

export const getTrending = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getTrendingProducts();
  res.json(ApiResponse.ok(products, "Trending products fetched"));
});

export const getNewArrivals = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getNewArrivals();
  res.json(ApiResponse.ok(products, "New arrivals fetched"));
});

export const getBestDeals = asyncHandler(async (_req: Request, res: Response) => {
  const products = await productService.getBestDeals();
  res.json(ApiResponse.ok(products, "Best deals fetched"));
});

export const getFacets = asyncHandler(async (_req: Request, res: Response) => {
  const facets = await productService.getFilterFacets();
  res.set("Cache-Control", "public, max-age=600");
  res.json(ApiResponse.ok(facets, "Filter facets fetched"));
});

export const getHome = asyncHandler(async (_req: Request, res: Response) => {
  const data = await productService.getHomeData();
  res.set("Cache-Control", "public, max-age=60");
  res.json(ApiResponse.ok(data, "Home data fetched"));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(ApiResponse.ok(product, "Product created"));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json(ApiResponse.ok(product, "Product updated"));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.json(ApiResponse.ok({ deleted: true }, "Product deleted"));
});
