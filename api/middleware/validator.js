import joi from '@hapi/joi';

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
        .regex(/^[A-Z]+$/)
        .uppercase()
        .required()
        .error(() => 'last name can only consist of alphabets'),
      password: joi
        .string()
        .trim()
        .regex(/^(?=.*\d)(?=.*[a-zA-Z])(?!.*[\W_\x7B-\xFF]).{6,15}$/)
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

    return joi.validate(user, schema);
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
        .error(
          () => 'Please Input your password!',
        ),
    });

    return joi.validate(user, schema);
  },
};
