import { Model } from '../model';
import { adminPassword } from '../config';
import { Auth, log } from '../utility';

require('custom-env').env(true);

class Admin {
  static Model() {
    return new Model('users');
  }

  static async seedAdmin() {
    const hashedPassword = Auth.hash(adminPassword);
    const columns = 'first_name, last_name, email, password, is_admin';
    const values = `'Ifeanyi', 'Nkwoji', 'ifeanyi@wayfarer.com', '${hashedPassword}', true`;
    const clause = 'RETURNING id, first_name, last_name, email, is_admin';

    try {
      await Admin.Model().insert(columns, values, clause);
    } catch (error) {
      log(error.messsage);
    }
  }
}

export default Admin;
