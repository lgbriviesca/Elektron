const { Products } = require('../models/productsModel');

const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const protectProductsOwner = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const user = await Products.findOne({
    where: { userId: sessionUser.id },
  });

  if (!user) {
    return next(
      new AppError('Only the owner of the product can do this action', 404)
    );
  }

  next();
});

module.exports = { protectProductsOwner };
