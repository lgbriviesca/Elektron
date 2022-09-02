const { Products } = require('../models/productsModel');
const { Order } = require('../models/ordersModel');
const { Cart } = require('../models/cartModel');
const { ProductsInCart } = require('../models/productsInCartModel');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const lodash = require('lodash');

const getAllProductsInACar = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const cartExists = await Cart.findOne({
    where: { userId: sessionUser.id },
  });
  const productsInCartExist = await ProductsInCart.findAll({
    where: { cartId: cartExists.id },
  });
  res.status(200).json({
    productsInCartExist,
  });
});

//-------------------------------------------------------------------------------------

const addProductToCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;

  const stock = await Products.findOne({
    where: { id: productId },
  });

  if (quantity > stock.quantity) {
    return next(
      new AppError('Requested quantity cannot be bigger than stock', 403)
    );
  }

  const cartExists = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  if (!cartExists) {
    await Cart.create({
      userId: sessionUser.id,
    });
  }

  if (cartExists.status === 'purchased') {
    await cartExists.update({
      status: 'active',
    });
  }

  const verifyCart = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  const productsInCartExist = await ProductsInCart.findOne({
    where: { cartId: verifyCart.id, productId },
  });

  if (productsInCartExist && productsInCartExist.status === 'removed') {
    await productsInCartExist.update({ status: 'active', quantity });
    return res.status(200).json({ status: 'Product added' });
  }

  if (productsInCartExist && productsInCartExist.status == 'active')
    return next(new AppError('You have already added this product', 403));

  const addProductInCart = await ProductsInCart.create({
    cartId: verifyCart.id,
    productId,
    quantity,
  });

  res.status(200).json({
    addProductInCart,
  });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  const cartExists = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  const productsInCartExist = await ProductsInCart.findOne({
    where: { cartId: cartExists.id, status: 'active', productId },
  });

  const stock = await Products.findOne({
    where: { id: productId },
  });

  if (quantity > stock.quantity) {
    return next(
      new AppError('Requested quantity cannot be bigger than stock', 403)
    );
  } else if (quantity == 0) {
    await productsInCartExist.update({ status: 'removed' });
  } else productsInCartExist;

  const updatedProductInCart = await productsInCartExist.update({
    quantity,
  });

  res
    .status(201)
    .json({ status: 'Succes, product in cart updated', updatedProductInCart });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { sessionUser } = req;

  const cartExists = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  const productsInCartExist = await ProductsInCart.findOne({
    where: { cartId: cartExists.id, status: 'active', productId },
  });

  const updatedProductInCart = await productsInCartExist.update({
    quantity: 0,
    status: 'removed',
  });

  res
    .status(200)
    .json({ status: 'Succes, product in cart removed:', updatedProductInCart });
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [
      {
        model: ProductsInCart,
        where: { status: 'active' },
      },
    ],
  });

  if (!userCart) {
    return next(new AppError('Oops, there are not products to purchase!', 400));
  }

  const products = userCart.productsInCarts.map(async productInCart => {
    const productInfo = await Products.findOne({
      where: { id: productInCart.productId },
    });

    const totalProductsPrice = productInfo.price * productInCart.quantity;
    const productQuantity = productInfo.quantity - productInCart.quantity;

    const quantityUpdated = await productInfo.update({
      quantity: productQuantity,
    });

    await productInCart.update({ status: 'purchased' });

    return totalProductsPrice;
  });

  const individualTotals = await Promise.all(products);
  let globalTotal = lodash.sum(individualTotals);

  const orderWithTotalPrice = await Order.create({
    cartId: userCart.id,
    userId: sessionUser.id,
    TotalPrice: globalTotal,
  });

  const purchasedProducts = await ProductsInCart.findAll({
    where: { cartId: userCart.id },
  });

  const purchasedMade = await userCart.update({
    status: 'purchased',
  });

  const orderCompleted = await Order.findOne({
    where: { cartId: userCart.id, status: 'active' },
  });

  const updatedOrder = await orderCompleted.update({
    status: 'completed',
  });

  res.status(200).json({ purchasedMade });
});

module.exports = {
  getAllProductsInACar,
  addProductToCart,
  updateProductInCart,
  removeProductFromCart,
  purchaseCart,
};

/*   const updatedPurchase = await userCart.update({
    status: 'purchased',
  });

  const orderCompleted = await Order.findOne({
    where: { cartId: userCart.id, status: 'active' },
  });

  const updatedOrder = await orderCompleted.update({
    status: 'completed',
  }); */

/* 
  const userCart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
  });

  const productsInCart = await ProductsInCart.findAll({ //descomentar este y borrar el de abajo
    where: { cartId: userCart.id, status: 'active' },
  });  */
