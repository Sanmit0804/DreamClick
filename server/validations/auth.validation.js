const validate = require('../middlewares/validate.middleware');
const authValidator = require('../validators/auth.validator');

class AuthValidations {
  static signUpValidation = validate({ body: authValidator.signUpBody });

  static loginValidation = validate({ body: authValidator.loginBody });

  static emailLoginValidation = validate({ body: authValidator.emailLoginBody });
}

module.exports = AuthValidations;
