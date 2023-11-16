import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import OperationalError from "./lib/operational-error";
import globalErrorHandler from "./middlewares/global-error-handler.middlewares";
import sanitizeMongoQuery from "./middlewares/sanitize-mongo-queries.middlewares";
import mainRouter from "./routers";

const app = express();

app.use(helmet());
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  message: "Too many requests made from this IP address, please try again after one hour.",
  standardHeaders: true,
});
app.use("/api", limiter);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(sanitizeMongoQuery);
app.use("/api/v1", mainRouter);
app.use((req, res, next) => next(new OperationalError(404, `Can't ${req.method} on ${req.originalUrl}.`)));
app.use(globalErrorHandler);

export default app;
