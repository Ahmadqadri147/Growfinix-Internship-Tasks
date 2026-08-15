import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import brandRoutes from "./brand.routes";
import reviewRoutes from "./review.routes";
import wishlistRoutes from "./wishlist.routes";
import orderRoutes from "./order.routes";
import searchRoutes from "./search.routes";
import adminRoutes from "./admin.routes";
import { getHome } from "../controllers/product.controller";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

router.get("/home", getHome);

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/reviews", reviewRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/search", searchRoutes);
router.use("/admin", adminRoutes);

export default router;
