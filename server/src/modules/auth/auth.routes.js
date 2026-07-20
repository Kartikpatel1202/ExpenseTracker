import { Router } from 'express';
import { requireAuth } from '../../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', (req, res) => {
  res.status(201).json({ message: 'Register endpoint to be implemented in Level 2' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint to be implemented in Level 2' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/profile', requireAuth, (req, res) => {
  res.json({ message: 'Profile update endpoint to be implemented in Level 2' });
});

export default router;

