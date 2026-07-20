import { Worker } from 'bullmq';
import { config } from '../config/env.js';

const connection = { url: config.redisUrl };

new Worker(
  'monthly-report',
  async (job) => {
    console.log('Generate monthly report job:', job.data);
  },
  { connection }
);

new Worker(
  'reminder',
  async (job) => {
    console.log('Send reminder job:', job.data);
  },
  { connection }
);

console.log('Background workers started');

