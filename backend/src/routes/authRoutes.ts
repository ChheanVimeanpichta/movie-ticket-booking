import { Router } from 'express';
import { login, signup } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema, signupSchema } from '../schemas/index.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/signup', validateRequest(signupSchema), signup);

export default router;
