const express = require('express');

const { protectToken } = require('../middlewares/usersMiddlewares');

const {
  getAllProductsInACar,
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
} = require('../controllers/ordersController');

const router = express.Router();

router.use(protectToken);

router.get('/products-in-cart', getAllProductsInACar);

router.post('/add-product', addProductToCart);

router.patch('/update-cart', updateProductInCart);

router.post('/purchase', purchaseCart);

router.delete('/:productId', removeProductFromCart);

module.exports = { cartRouter: router };
