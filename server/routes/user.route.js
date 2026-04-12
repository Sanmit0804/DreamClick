const express = require('express');
const { userController } = require('../controllers/index');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/cart', authenticate, userController.toggleCart);
router.post('/favorites', authenticate, userController.toggleFavorite);

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUserById);

module.exports = router;