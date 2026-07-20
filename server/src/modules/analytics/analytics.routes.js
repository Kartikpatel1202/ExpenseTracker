import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', (req, res) => {
  res.json({ income: 0, expense: 0, balance: 0, pendingSplits: 0 });
});

router.get('/category-wise', (req, res) => {
  res.json({ data: [] });
});

router.get('/month-wise', (req, res) => {
  res.json({ data: [] });
});

router.get('/export', (req, res) => {
  res.json({ message: 'CSV export endpoint to be implemented in Level 4' });
});

export default router;

