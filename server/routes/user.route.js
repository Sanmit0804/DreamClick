const express = require('express');
const { userController } = require('../controllers/index');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { userValidator } = require('../validators');

const router = express.Router();

router.post('/cart', authenticate, validate({ body: userValidator.cartBody }), userController.toggleCart);
router.post('/favorites', authenticate, validate({ body: userValidator.cartBody }), userController.toggleFavorite);

router.route('/')
  .get(userController.getUsers)
  .post(validate({ body: userValidator.createUserBody }), userController.createUser);

router.route('/:id')
  .get(validate({ params: userValidator.userParams }), userController.getUserById)
  .patch(
    validate({
      params: userValidator.userParams,
      body: userValidator.updateUserBody,
    }),
    userController.updateUser
  )
  .delete(validate({ params: userValidator.userParams }), userController.deleteUserById);

module.exports = router;
