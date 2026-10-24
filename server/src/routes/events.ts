import { Router } from 'express';
import { auth } from '../middleware/auth';
import { notificationLog } from '../events/events';

const router = Router();

// GET /events → the logged-in user's recent notifications, newest first
router.get('/', auth, (req, res) => {
  res.json(notificationLog.filter((e) => e.user === req.user!.email));
});

export default router;
