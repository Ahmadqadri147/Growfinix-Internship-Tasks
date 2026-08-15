import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { generalRateLimiter } from "./middleware/rateLimiter.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import imageRoutes from "./routes/image.routes";
import routes from "./routes";

export function createApp(): express.Application {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );

  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  if (env.NODE_ENV !== "test") {
    app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
  }

  app.use("/api/v1/images", imageRoutes);

  app.use("/api/v1", generalRateLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
