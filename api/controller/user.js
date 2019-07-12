import Auth from '../utility';
import model from '../model';
import validator from '../middleware/validator';

class Users {
  static Model() {
    return new model.Model('users');
  }

  /**
  * @description Creates new user account
  * @param {object} req request object
  * @param {object} res response object
  * @returns {object}  JSON response
  */
  static async signUp(req, res) {
    const { error } = validator.signupValidator(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        error: error.details[0].message,
      });
    }
    const {
      first_name, last_name, email, password,
    } = req.body;
    const hashedP = Auth.hash(password);
    const columns = 'first_name, last_name, email, password';
    const values = `'${first_name}', '${last_name}', '${email}', '${hashedP}'`;
    const clause = 'RETURNING id, first_name, last_name, email, is_admin';

    try {
      const data = await Users.Model().insert(columns, values, clause);
      const { id, is_admin, created_on } = data[0];
      const token = Auth.generateToken({
        id, email, first_name, last_name, is_admin, created_on,
      });

      res.setHeader('Authorization', `Bearer ${token}`);

      res.status(201).json({
        status: 201,
        data: {
          token, id, email, first_name, last_name, is_admin,
        },
      });
    } catch (err) {
      if (err.routine === '_bt_check_unique') {
        res.status(409).json({
          status: 409, error: `A user has already registered with this email!
Please use another email`,
        });
      }
      res.status(500).json({
        status: 500, error: 'Internal server error',
      });
    }
  }
}

module.exports = Users;
