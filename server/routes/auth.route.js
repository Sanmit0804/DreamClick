const express = require('express');
const AuthController = require('../controllers/auth.controller');
const AuthValidations = require('../validations/auth.validation');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', AuthValidations.loginValidation, AuthController.login);
router.post('/signup', AuthValidations.signUpValidation, AuthController.signup);
router.post('/email-login', AuthValidations.emailLoginValidation, AuthController.emailLogin);
router.get('/verify', authenticate, AuthController.verify);

module.exports = router;
