import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { authRateLimiter } from "../middleware/rateLimiter.middleware";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/auth.validator";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
router.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
