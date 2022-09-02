const jwt = require('jsonwebtoken');

/* --------  Este middleware está hecho para uatenticar al usuario: Cada vez que un usuario da login, el jwt lee sus datos y le asigna un webtoken, ese webtoken tiene caudcidad
,especificada en el archivo config.env. Ese webtoken es necesario para que el usuario pueda llevar a cabo ciertas tareas, como comprar, ver productos, etc...*/


// Models
const { User } = require('../models/usersModel');

// Utils
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

const protectToken = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // ['Bearer', 'token']
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Session invalid', 403));
  }

  // Validate token 
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // decoded returns -> { id: 1, iat: 1651713776, exp: 1651717376 }
  const user = await User.findOne({
    where: { id: decoded.id, status: 'active' },
  });

  if (!user) {
    return next(
      new AppError('The owner of this token is no longer available', 403)
    );
  }

  req.sessionUser = user;
  next();
});

const protectAdmin = catchAsync(async (req, res, next) => {
  console.log(req.sessionUser)
  if (req.sessionUser.role !== 'admin') {
    return next(new AppError('Access not granted', 403));
  }

  next();
});

const userExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: { id, status: 'active' },
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return next(new AppError('User does not exist with given Id', 404));
  }

  // If the ids are equal, the request pass
  req.user = user;
  next();
});

const protectAccountOwner = catchAsync(async (req, res, next) => {
  const { sessionUser, user } = req;

  if (sessionUser.id !== user.id) {
    return next(new AppError('You do not own this account', 403));
  }

  next();
});

module.exports = {
  userExists,
  protectToken,
  protectAdmin,
  protectAccountOwner,
};
