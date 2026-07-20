import { Queue } from 'bullmq';
import { config } from '../config/env.js';

const connection = { url: config.redisUrl };

export const monthlyReportQueue = new Queue('monthly-report', { connection });
export const reminderQueue = new Queue('reminder', { connection });

