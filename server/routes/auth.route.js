const express = require('express');
const AuthController = require('../controllers/auth.controller.js');
const AuthValidations = require('../validations/auth.validation.js')
const router = express.Router();

router.post('/login', AuthValidations.loginValidation, AuthController.login)

router.post('/signup', AuthValidations.signUpValidation, AuthController.signup)

module.exports = router;