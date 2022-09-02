const express = require('express');
const { protectProductsOwner } = require('../middlewares/productsMiddlewares');

const {
  createProductValidations,
  checkValidations,
} = require('../middlewares/validationsMiddlewares');

const {
  protectAdmin,
  protectToken,
} = require('../middlewares/usersMiddlewares');

const {
  getAllCategories,
  createCategory,
  updateCategory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productsController');

const router = express.Router();

router.get('/', getAllProducts); 

router.get('/categories', getAllCategories);

router.get('/:id', getProductById);

router.use(protectToken, protectAdmin);

router.post('/categories', createCategory);

router.patch('/categories/:id', updateCategory);

router.post('/', createProductValidations, checkValidations, createProduct);

router
  .route('/:id')
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = { productsRouter: router };
