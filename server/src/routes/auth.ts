import { Router } from 'express';
import { login, me, register } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { requireJson } from '../middleware/requireJson';
import { loginRules, registerRules } from '../middleware/validate';

const router = Router();

router.post('/register', requireJson, registerRules, register);
router.post('/login', requireJson, loginRules, login);
router.get('/me', auth, me);

export default router;
