const express = require('express');
const AuthController = require('../controllers/auth.controller.js');
const AuthValidations = require('../validations/auth.validation.js')
const { authenticate } = require('../middlewares/auth.middleware.js');
const router = express.Router();

router.post('/login', AuthValidations.loginValidation, AuthController.login)

router.post('/signup', AuthValidations.signUpValidation, AuthController.signup)
router.post('/email-login', AuthController.emailLogin)

router.get('/verify', authenticate, AuthController.verify)

module.exports = router;