import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';

// Import Routes
import authRoutes from './routes/auth.routes';
import residentRoutes from './routes/resident.routes';
import medicationRoutes from './routes/medication.routes';
import healthRecordRoutes from './routes/healthRecord.routes';
import dailyCareLogRoutes from './routes/dailyCareLog.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import activityFeedRoutes from './routes/activityFeed.routes';

const app: Application = express();

import cookieParser from 'cookie-parser';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());
app.use(
  morgan('short', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Global Rate Limiting
app.use('/api', rateLimiter);

import userRoutes from './routes/user.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/care-logs', dailyCareLogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityFeedRoutes);
app.use('/api/activity-feed', activityFeedRoutes);

// Error Handler
app.use(errorHandler);

export default app;
