import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { validateObjectIdParam } from "../utils/objectId";
import { createReviewSchema, reviewQuerySchema } from "../validators/review.validator";
import * as reviewController from "../controllers/review.controller";

const router = Router();

router.get("/product/:productId", validateObjectIdParam("productId"), validate(reviewQuerySchema, "query"), reviewController.getByProduct);
router.get("/product/:productId/breakdown", validateObjectIdParam("productId"), reviewController.getBreakdown);
router.post("/product/:productId", validateObjectIdParam("productId"), authenticate, validate(createReviewSchema), reviewController.create);
router.post("/:id/helpful", validateObjectIdParam("id"), authenticate, reviewController.helpful);
router.delete("/:id", validateObjectIdParam("id"), authenticate, reviewController.remove);

export default router;
