import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later",
  },
  keyGenerator: (req) => {
    return (
      req.ip ??
      (req.headers["x-forwarded-for"] as string | undefined) ??
      "unknown"
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts, please try again later",
  },
  keyGenerator: (req) => {
    return (
      req.ip ??
      (req.headers["x-forwarded-for"] as string | undefined) ??
      "unknown"
    );
  },
});

export const scoreLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many score submissions, please try again later",
  },
  keyGenerator: (req) => {
    return (
      req.ip ??
      (req.headers["x-forwarded-for"] as string | undefined) ??
      "unknown"
    );
  },
});
