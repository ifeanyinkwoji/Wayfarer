import joiBase from '@hapi/joi';


const joi = joiBase.extend(require('joi-jwt'));
const config = require('../config');

module.exports = {
  /**
   * @description Validates all fields in signup request body
   * @param {user} object
   */
  signupValidator(user) {
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
        .regex(/^[A-Z]+$/)
        .uppercase()
        .required()
        .error(() => 'first name can only consist of alphabets'),
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
  },

  /**
   * @description Validates all fields in signup request body
   * @param {user} object
   */
  signinValidator(user) {
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

    return joi.validate(user, schema, { abortEarly: true });
  },

  tripValidator(trip) {
    const schema = joi
      .object()
      .keys({
        bus_id: joi
          .string()
          .trim()
          .required()
          .guid({ version: 'uuidv4' })
          .error(() => 'Please enter a valid bus id. The bus_id format shoud be "uuid version 4"'),
        origin: joi
          .string()
          .trim()
          .alphanum()
          .min(2)
          .max(30)
          .required()
          .error(() => 'Please enter the  origin. It should be alphanumerical with least 2 or at most 30 characters'),
        destination: joi
          .string()
          .trim()
          .alphanum()
          .min(2)
          .max(30)
          .required()
          .error(() => 'Please enter the  destination. It should be alphanumerical with at least 2 or at most 30 characters'),
        fare: joi
          .number()
          .min(500)
          .required()
          .error(() => 'Please enter the fare. It should be at least 500'),
        token: joi
          .jwt()
          .valid({ secret: config.jwtKey })
          .required()
          .error(() => 'Please enter a valid admin token'),
      });

    return joi.validate(trip, schema, { abortEarly: false });
  },
};
