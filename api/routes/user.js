import express from 'express';
import Users from '../controller/user';

const router = express.Router();

/**
 * User can signup
 */
router.post('/auth/signup', Users.signUp);

/**
 * User can signin
 */
router.post('/auth/signin', Users.signIn);


module.exports = router;
