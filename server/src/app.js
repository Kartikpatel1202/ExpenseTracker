import cors from 'cors';
import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import expenseRoutes from './modules/expenses/expense.routes.js';
import groupRoutes from './modules/groups/group.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'expense-tracker-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/groups', groupRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

