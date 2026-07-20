import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Groups endpoint to be implemented in Level 6' });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Create group endpoint to be implemented in Level 6' });
});

router.post('/:id/members', (req, res) => {
  res.json({ message: 'Add member endpoint to be implemented in Level 6' });
});

router.post('/:id/splits', (req, res) => {
  res.json({ message: 'Split expense endpoint to be implemented in Level 6' });
});

router.post('/:id/settlements', (req, res) => {
  res.json({ message: 'Settlement endpoint to be implemented in Level 6' });
});

router.get('/:id/messages', (req, res) => {
  res.json({ data: [], message: 'Message history endpoint to be implemented in Level 7' });
});

export default router;

