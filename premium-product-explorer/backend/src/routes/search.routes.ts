import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { z } from "zod";
import * as searchController from "../controllers/search.controller";

const router = Router();

const recordSchema = z.object({
  query: z.string().min(1).max(120),
  resultsCount: z.number().int().min(0).optional()
});

router.get("/trending", searchController.trending);
router.get("/recent", authenticate, searchController.recent);
router.post("/record", validate(recordSchema), searchController.recordSearch);
router.delete("/recent", authenticate, searchController.clear);

export default router;
