//bcrypt encripta la contraseña para que sea segura (línea 25 y 26)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { User } = require('../models/usersModel');
const { Order } = require('../models/ordersModel');
const { Cart } = require('../models/cartModel');
const { ProductsInCart } = require('../models/productsInCartModel');
const { Products } = require('../models/productsModel');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { app } = require('../app');

dotenv.config({ path: './config.env' });

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll();

  users.password = undefined;

  res.status(200).json({
    users,
  });
});

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  //en la línea 25: se genera un "salto" de 12, o sea, la contraseña a codificar tendrá 12 caracteres que la librería bcrypt maneja por su cuenta;
  //en la línea 26: bcrypt "hashea" la contraseña, o sea, recibe el password que se envió desde el body y lo encripta tomando en cuenta el "salto" que se le especifió anteriormente
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
  });

  res.status(201).json({ newUser });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email },
  });

  if (user.status === 'unavailable') {
    return next(new AppError('Invalid credentials', 400));
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Invalid credentials', 400));
  }

  user.update({ status: 'active' });

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(200).json({ token, user });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { username, email } = req.body;

  await user.update({ username, email });

  res.status(200).json({ status: 'Success: user updated' });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'disabled' });

  res.status(200).json({
    status: 'Success: user disabled',
  });
});

const getUserOrders = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  if (
    (await Cart.findOne({ where: { userId: sessionUser.id } })) === undefined
  ) {
    return next(new AppError('This user has no orders', 403));
  }

  const order = await Order.findAll({
    where: { userId: sessionUser.id },
    include: {
      model: Cart,
      where: { userId: sessionUser.id },
      include: [{ model: ProductsInCart, where: { status: 'purchased' } }],
    },
  });

  res.status(200).json({
    order,
  });
});

const getUserOrdersById = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id, userId: req.sessionUser.id },
    include: {
      model: Cart,
      where: { userId: sessionUser.id },
      include: [{ model: ProductsInCart, where: { status: 'purchased' } }],
    },
  });

  if (!order) {
    return next(new AppError('Order with given id does not exist', 403));
  }

  res.status(200).json({
    order,
  });
});

const getUserProducts = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const myProducts = await Products.findAll({
    where: { userId: sessionUser.id },
  });

  res.status(201).json({ myProducts });
});

//el checktoken es sólo para que en el front puedan saber cuál es el token.
const checkToken = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const token = await jwt.sign({ id: sessionUser.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ user: req.sessionUser, token });
});

const logout = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  await sessionUser.update({ status: 'inactive' });

  //res.redirect('http://google.com') //redirigir al home de la página
  res.status(200).json({ status: 'logged out successfully' }); //método alternativo: si el front recibe esta respuesta, redirigir
});

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
  checkToken, //el checktoken es sólo para que en el front lo puedan consultar.
  getUserOrders,
  getUserOrdersById,
  getUserProducts,
  logout,
};
