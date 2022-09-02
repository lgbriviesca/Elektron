const { Category } = require('../models/categoriesModel');
const { Products } = require('../models/productsModel');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const getAllProducts = catchAsync(async (req, res, next) => {
  const products = await Products.findAll({
    where: { status: 'active' },
  });

  res.status(200).json({
    products,
  });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { title, description, quantity, price, categoryId, imgUrls } = req.body;

  const categoryExists = await Category.findOne({
    where: { id: categoryId, status: 'active' },
  });

  if (!categoryExists) {
    return next(new AppError('Category with given id does not exist', 403));
  }

  const newProduct = await Products.create({
    title,
    description,
    quantity,
    price,
    categoryId,
    imgUrls,
    userId: sessionUser.id,
  });

  res.status(201).json({ newProduct });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const productById = await Products.findOne({
    where: { id, status: 'active' },
  });

  if (!productById) {
    return next(new AppError('Product with given id does not exist', 403));
  }

  res.status(200).json({ productById });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, quantity, price, imgUrls } = req.body;

  const productToUpdate = await Products.findOne({
    where: { id, status: 'active' },
  });

  if (!productToUpdate) {
    return next(
      new AppError('Product with given id does not exist or is not active', 403)
    );
  }

  await productToUpdate.update({
    title,
    description,
    quantity,
    price,
    imgUrls,
  });

  res.status(200).json({ status: 'success, product updated' });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const productToDelete = await Products.findOne({
    where: { id, status: 'active' },
  });

  if (!productToDelete) {
    return next(new AppError('Product with given id is not active', 403));
  }

  await productToDelete.update({ status: 'unavailable' });

  res.status(200).json({ status: 'success' });
});

//--------------

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
  });

  res.status(201).json({ newCategory });
});

const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    where: { status: 'active' },
  });

  res.status(200).json({
    categories,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, status } = req.body;

  const categoryToUpdate = await Category.findOne({
    where: { id, status: 'active' },
  });

  if (!categoryToUpdate) {
    return next(
      new AppError(
        'Category with given id does not exist or is not active',
        403
      )
    );
  }

  await categoryToUpdate.update({ name, status });

  res.status(200).json({ status: 'success, category updated' });
});

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
