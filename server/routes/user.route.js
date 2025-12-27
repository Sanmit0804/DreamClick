const express = require('express');
const { userController } = require('../controllers/index');

const router = express.Router();

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUserById);

module.exports = router;