import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { validateObjectIdParam } from "../utils/objectId";
import { productQuerySchema } from "../validators/product.validator";
import * as productController from "../controllers/product.controller";

const router = Router();

router.get("/", validate(productQuerySchema, "query"), productController.getProducts);
router.get("/suggestions", productController.getSuggestions);
router.get("/featured", productController.getFeatured);
router.get("/trending", productController.getTrending);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/best-deals", productController.getBestDeals);
router.get("/facets", productController.getFacets);
router.get("/:id", validateObjectIdParam("id"), productController.getProductById);
router.get("/:id/related/:categoryId", validateObjectIdParam("id"), validateObjectIdParam("categoryId"), productController.getRelated);

export default router;
