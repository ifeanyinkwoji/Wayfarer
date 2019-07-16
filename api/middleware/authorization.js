import jwt from 'jsonwebtoken';
import Auth from '../utility';

/**
 * @description User Authorization
 * @exports Authorization
 */
class Authorization {
  /**
   * @description Checks if user is admin and has a valid token
   *              to access admin endpoints
   * @param {object} req request object
   * @param {object} res response object
   * @returns {boolean} returns true or false for admin verification
   */
  static verifyAdmin(req, res, next) {
    try {
      const { token } = req.body;
      const decoded = Auth.verifyToken(token);
      if (!decoded.is_admin) {
        return res.status(403).json({
          status: 'error',
          error: 'Access denied',
        });
      }
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        error: 'Invalid token',
      });
    }
  }

  /**
   * @description Checks if user is signed in and has a valid token
   *              to access user endpoints
   * @param {object} req request object
   * @param {object} res response object
   * @returns {boolean} returns true or false for user verification
   */
  static async verifyUser(req, res, next) {
    try {
      const { token } = req.body;
      const decoded = await Auth.verifyToken(token);
      req.user = decoded;
      if (!decoded.id) {
        return res.status(403).json({
          status: 'error',
          error: 'Access denied',
        });
      }
      return next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        error: 'Invalid token',
      });
    }
  }
}

module.exports = Authorization;
