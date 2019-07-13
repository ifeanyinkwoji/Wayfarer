import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';

const { jwtKey } = config;

class Auth {
  /**
   * @param {string} password password string to be hashed
   */
  static hash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
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
}

module.exports = Auth;
