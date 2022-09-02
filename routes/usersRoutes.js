const express = require('express');

// Middlewares
const {
  userExists,
  protectAdmin,
  protectToken,
  protectAccountOwner,
} = require('../middlewares/usersMiddlewares');

const {
  createUserValidations,
  updateUserValidations,
  checkValidations,
} = require('../middlewares/validationsMiddlewares');

// Controller
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
  checkToken,
  getUserOrders,
  getUserOrdersById,
  getUserProducts,
  logout,
} = require('../controllers/usersController');

const router = express.Router();

router.post('/', createUserValidations, checkValidations, createUser);

router.post('/login', login);

router.use(protectToken);

router.get('/', protectAdmin, getAllUsers); //cuando esté en producción, debe estar protegida por: protectAdmin o borrarla

router.post('/logout', logout);

router.get('/me', getUserProducts);

router.get('/orders', getUserOrders);

router.get('/orders/:id', getUserOrdersById);

router.get('/check-token', protectAdmin, checkToken); //cuando esté en producción, debe estar protegida por: protectAdmin o borrarla

router
  .use('/:id', userExists, protectAccountOwner)
  .route('/:id')
  .patch(updateUserValidations, checkValidations, updateUser)
  .delete(deleteUser);

module.exports = { usersRouter: router };
