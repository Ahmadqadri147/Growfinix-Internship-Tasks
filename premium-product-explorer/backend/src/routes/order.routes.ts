import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { validateObjectIdParam } from "../utils/objectId";
import { createOrderSchema } from "../validators/order.validator";
import * as orderController from "../controllers/order.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.create);
router.get("/", orderController.getOrders);
router.get("/:id", validateObjectIdParam("id"), orderController.getById);

export default router;
