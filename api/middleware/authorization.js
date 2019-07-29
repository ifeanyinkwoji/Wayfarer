import { Auth } from '../utility';
import { resUnauthorized, resForbidden } from '../utility/response';

const { verifyToken } = Auth;

/**
 * @description User Authorization
 * @exports Authorization
 */
class Authorization {
  /**
   * @description Confirms that a user is an admin an has a valid admin token
   * @param {object} req request object
   * @param {object} res response object
   */
  static verifyAdmin(req, res, next) {
    try {
      const token = req.get('Authorization').replace('Bearer ', '');
      const decoded = verifyToken(token);
      const { is_admin } = decoded;
      if (!is_admin) {
        return resForbidden(res, 'Access denied');
      }
      return next();
    } catch (error) {
      return resUnauthorized(res, 'Invalid token');
    }
  }

  /**
   * @description Verifies if user is signed in and has a valid token
   * to access user resources
   * @param {object} req request object
   * @param {object} res response object
   */
  static verifyUser(req, res, next) {
    try {
      const token = req.get('Authorization').replace('Bearer ', '');
      const decoded = verifyToken(token);
      req.user = decoded;
      if (!req.user.id) {
        return resForbidden(res, 'Access denied');
      }
      return next();
    } catch (error) {
      return resUnauthorized(res, 'Invalid token or none provided');
    }
  }
}

export default Authorization;
