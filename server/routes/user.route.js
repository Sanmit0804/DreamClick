const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();

router.get('/users', userController.getUsers);
router.delete('/users/:id', userController.deleteUserById);

module.exports = router;