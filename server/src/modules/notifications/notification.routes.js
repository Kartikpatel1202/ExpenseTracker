import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ data: [], message: 'Notification center endpoint to be implemented in Level 8' });
});

router.patch('/:id/read', (req, res) => {
  res.json({ message: 'Mark notification as read endpoint to be implemented in Level 8' });
});

router.post('/subscribe', (req, res) => {
  res.json({ message: 'Web notification subscription endpoint to be implemented in Level 8' });
});

export default router;

