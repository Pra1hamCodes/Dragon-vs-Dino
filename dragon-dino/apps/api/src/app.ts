import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import authRoutes from './routes/auth.js';
import scoreRoutes from './routes/scores.js';
import userRoutes from './routes/users.js';
import achievementRoutes from './routes/achievements.js';
import seasonRoutes from './routes/seasons.js';
import challengeRoutes from './routes/challenges.js';
import multiplayerRoutes from './routes/multiplayer.js';
import { setupSocketHandlers } from './socket/index.js';

const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,
  },
});
setupSocketHandlers(io);

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", process.env.SUPABASE_URL ?? ''],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp());
app.disable('x-powered-by');

// Request ID
app.use((req, _res, next) => {
  (req as Record<string, unknown>).id = crypto.randomUUID();
  next();
});

// Rate limiting
app.use(globalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/multiplayer', multiplayerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { app, httpServer, io };
