import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { validateObjectIdParam } from "../utils/objectId";
import {
  productQuerySchema,
  createProductSchema,
  updateProductSchema,
  productIdSchema
} from "../validators/product.validator";
import * as adminController from "../controllers/admin.controller";
import * as productController from "../controllers/product.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/stats", adminController.stats);
router.get("/top-searches", adminController.topSearches);
router.get("/search-volume", adminController.searchVolume);
router.get("/revenue", adminController.revenueByDay);
router.get("/most-viewed", adminController.mostViewed);
router.get("/recent-activity", adminController.recentActivity);
router.get("/category-distribution", adminController.categoryDistribution);

router.get("/products", validate(productQuerySchema, "query"), adminController.adminProducts);
router.post("/products", validate(createProductSchema), productController.createProduct);
router.patch(
  "/products/:id",
  validateObjectIdParam("id"),
  validate(productIdSchema, "params"),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete("/products/:id", validateObjectIdParam("id"), validate(productIdSchema, "params"), productController.deleteProduct);

export default router;
