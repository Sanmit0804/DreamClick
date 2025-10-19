const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.route('/users')
  .get(userController.getUsers);

router.route('/users/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUserById);

module.exports = router;