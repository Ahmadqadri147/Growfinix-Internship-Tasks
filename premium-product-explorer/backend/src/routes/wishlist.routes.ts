import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validateObjectIdParam } from "../utils/objectId";
import * as wishlistController from "../controllers/wishlist.controller";

const router = Router();

router.use(authenticate);

router.get("/", wishlistController.getWishlist);
router.get("/:productId/status", validateObjectIdParam("productId"), wishlistController.status);
router.post("/:productId", validateObjectIdParam("productId"), wishlistController.add);
router.delete("/:productId", validateObjectIdParam("productId"), wishlistController.remove);

export default router;
