import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

const JWT_PUBLIC_KEY = process.env["JWT_PUBLIC_KEY"] ?? "";

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

async function verifyAndAttachUser(
  req: Request,
  token: string
): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return false;
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return true;
  } catch (err) {
    logger.debug("JWT verification failed", {
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return false;
  }
}

export async function auth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const valid = await verifyAndAttachUser(req, token);
  if (!valid) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (token) {
    await verifyAndAttachUser(req, token);
  }

  next();
}
