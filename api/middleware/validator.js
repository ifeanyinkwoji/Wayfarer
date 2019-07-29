import joiBase from '@hapi/joi';
import { jwtKey } from '../config';

const joi = joiBase.extend(require('joi-jwt'));

class Validator {
  /**
   * @description Validates all fields in signup request body
   * @param {user} object
   */
  static signupValidator(user) {
    const schema = joi.object().keys({
      email: joi
        .string()
        .trim()
        .email()
        .required()
        .error(
          () => `Please enter a valid email address.
Example 1: "orlando@gmail.com"`,
        ),
      first_name: joi
        .string()
        .trim()
        .alphanum()
        .uppercase()
        .required()
        .error(() => 'Enter firstname. It must be alphanumerical'),
      last_name: joi
        .string()
        .trim()
        .alphanum()
        .required()
        .error(() => 'Enter lastname. It must be alphanumerical'),
      password: joi
        .string()
        .trim()
        .regex(/^(?=.*\d)(?=.*[a-zA-Z])(?!.*[\W_\x7B-\xFF]).{6,20}$/)
        .required()
        .error(
          () => `Password must be 6-20 characters long including at least 1 upper or lower alpha, and 1 digit
Example: Oglocke245`,
        ),
      confirmPassword: joi
        .any()
        .valid(joi.ref('password'))
        .required()
        .options({ language: { any: { allowOnly: 'must match password' } } }),
    });

    return joi.validate(user, schema, { abortEarly: false });
  }

  /**
   * @description Validates all fields in signup request body
   * @param {user} object
   */
  static signinValidator(user) {
    const schema = joi.object().keys({
      email: joi
        .string()
        .trim()
        .email()
        .required()
        .error(
          () => `Please enter a valid email address.
Example 1: "orlando@gmail.com"`,
        ),
      password: joi
        .string()
        .trim()
        .required()
        .error(() => 'Please Input your password!'),
    });

    return joi.validate(user, schema, { abortEarly: false });
  }

  static tripValidator(trip) {
    const schema = joi.object().keys({
      bus_id: joi
        .number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .error(
          () => 'Please enter a valid bus id. The bus_id should be an integer between 1 and "number of buses" inclusive.',
        ),
      origin: joi
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9\s,'-]*$/)
        .min(2)
        .max(30)
        .required()
        .error(
          () => 'Please enter the  origin. It should be at least 2 or at most 30 characters',
        ),
      destination: joi
        .string()
        .trim()
        .regex(/^[a-zA-Z0-9\s,'-]*$/)
        .min(2)
        .max(30)
        .required()
        .error(
          () => 'Please enter the  destination. It should be at least 2 or at most 30 characters',
        ),
      fare: joi
        .number()
        .min(500)
        .required()
        .error(() => 'Please enter the fare. It should be at least 500'),
      token: joi
        .jwt()
        .valid({ secret: jwtKey })
        .error(() => 'Please enter a valid admin token'),
    });

    return joi.validate(trip, schema, { abortEarly: false });
  }

  static bookTripValidator(trip) {
    const schema = joi.object().keys({
      trip_id: joi
        .number()
        .integer()
        .min(1)
        .required()
        .error(
          () => 'Please enter a valid bus id. The trip_id should be an integer that equals 1 or is greater.',
        ),
      seat_number: joi
        .number()
        .integer()
        .min(1)
        .error(
          () => 'Please enter the  seat number. The seat number should be an integer that equals 1 or is greater.',
        ),
      user_id: joi
        .number()
        .integer()
        .min(1)
        .error(
          () => 'Please enter the  user id. The user id should be an integer that equals 1 or is greater.',
        ),
      token: joi
        .jwt()
        .valid({ secret: jwtKey })
        .error(() => 'Please enter a valid admin token'),
      is_admin: joi
        .boolean()
        .invalid(false)
        .error(() => 'Access Denied. You do not have the proper authorization'),
    });

    return joi.validate(trip, schema, { abortEarly: false });
  }

  static getTripValidator(trip) {
    const schema = joi.object().keys({
      user_id: joi
        .number()
        .integer()
        .min(1)
        .error(
          () => 'Please enter the  user id. The user id should be an integer that equals 1 or is greater.',
        ),
      token: joi
        .jwt()
        .valid({ secret: jwtKey })
        .error(() => 'Please enter a valid admin token'),
      is_admin: joi
        .boolean()
        .invalid(false)
        .error(() => 'Access Denied. You do not have the proper authorization'),
    });

    return joi.validate(trip, schema, { abortEarly: false });
  }
}

export default Validator;
