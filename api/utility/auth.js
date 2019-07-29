import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { jwtKey } from '../config';

config();

class Auth {
  /**
   * @param {string} password password string to be hashed
   */
  static hash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }

  /**
   * @param {string} password provided password
   * @param {string} hash hashed password in database
   */
  static compare(password, hash) {
    return bcrypt.compareSync(password, hash);
  }

  /**
   * @description Generates access token
   * @param {object} payload User credential(s)
   * @param {string} secret encryption key
   * @param {string} duration token expiry time
   * @returns {string} Access token
   */
  static generateToken(payload, secret = jwtKey, duration = '7d') {
    return jwt.sign(payload, secret, { expiresIn: duration });
  }

  /**
   * @description  Verifies and decodes the access token
   * @param {string} token  Access token
   * @param {string} secret decryption key
   * @returns {object} Decoded Access token
   */
  static verifyToken(token, secret = jwtKey) {
    return jwt.verify(token, secret);
  }
}

export default Auth;
