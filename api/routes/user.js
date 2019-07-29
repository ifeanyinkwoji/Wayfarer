import { Router } from 'express';
import Users from '../controller/user';

const router = Router();

// Import controller
const { signUp, signIn } = Users;

// New User Signup
router.post('/signup', signUp);

// User signin
router.post('/signin', signIn);

export default router;
