import express from 'express';
import Users from '../controller/user';

const router = express.Router();

const handleSignup = (req, res) => {
  // const { first_name, last_name, email, password } = req.body;

  console.log(req.body);
  res.json({ status: 201, data: req.body });
};

/**
 * User can signup
 */
router.post('/auth/signup', Users.signUp);

module.exports = router;
