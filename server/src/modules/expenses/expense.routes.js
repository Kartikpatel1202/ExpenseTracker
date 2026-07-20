import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Expense list endpoint to be implemented in Level 3' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Expense create endpoint to be implemented in Level 3' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Expense detail endpoint to be implemented in Level 3' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Expense update endpoint to be implemented in Level 3' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Expense delete endpoint to be implemented in Level 3' });
});

router.post('/:id/receipt', (req, res) => {
  res.json({ message: 'Receipt upload endpoint to be implemented in Level 5' });
});

export default router;

