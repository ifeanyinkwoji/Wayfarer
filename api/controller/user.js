import { Model } from '../model';
import { Auth } from '../utility';
import {
  resConflict,
  resInternalServer,
  resUnauthorized,
  resSuccess,
  resBadRequest,
} from '../utility/response';
import Validate from '../middleware/validator';

const { signinValidator, signupValidator } = Validate;

class Users {
  static Model() {
    return new Model('users');
  }

  /**
   * @description Creates new user account
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object}  JSON response
   */
  static async signUp(req, res) {
    const { error } = signupValidator(req.body);
    if (error) {
      const errMessage = error.details.map(err => `${err.path}: ${err.message}`).join('\n');
      return resBadRequest(res, errMessage);
    }

    const {
      first_name, last_name, email, password,
    } = req.body;
    const hashedPassword = Auth.hash(password);
    const columns = 'first_name, last_name, email, password';
    const values = `'${first_name}', '${last_name}', '${email}', '${hashedPassword}'`;
    const clause = 'RETURNING id, first_name, last_name, email, is_admin';

    try {
      const data = await Users.Model().insert(columns, values, clause);
      const { id, is_admin } = data[0];
      const token = Auth.generateToken({
        id,
        email,
        first_name,
        last_name,
        is_admin,
      });
      return resSuccess(res, 201, { token, ...data[0] });
    } catch (errr) {
      if (errr.routine === '_bt_check_unique') {
        return resConflict(res, 'A user with this email already exists');
      }
      return resInternalServer(res);
    }
  }

  static async signIn(req, res) {
    const { error } = signinValidator(req.body);
    if (error) {
      const errMessage = error.details.map(err => `${err.path}: ${err.message}`).join('\n');
      return resBadRequest(res, errMessage);
    }

    const { email, password } = req.body;
    const columns = 'id, email, first_name, last_name, password, is_admin';
    const clause = `WHERE email='${email}'`;
    try {
      const data = await Users.Model().select(columns, clause);
      if (!data[0]) return resUnauthorized(res, 'Invalid Signin Details');
      if (!Auth.compare(password, data[0].password)) {
        return resUnauthorized(res, 'Invalid Signin Details');
      }
      const {
        id, is_admin, first_name, last_name,
      } = data[0];
      const output = {
        id, email, first_name, last_name, is_admin,
      };
      const token = Auth.generateToken({ ...output });
      return resSuccess(res, 200, { token, ...output });
    } catch (errs) {
      return resInternalServer(res);
    }
  }
}

export default Users;
