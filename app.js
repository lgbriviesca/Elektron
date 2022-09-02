const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const { globalErrorHandler } = require('./controllers/errorsController');

const { usersRouter } = require('./routes/usersRoutes');
const { productsRouter } = require('./routes/productsRouter');
const { cartRouter } = require('./routes/cartRouter');

const app = express();

app.use(cors());

app.use(express.json());

app.use(helmet());

app.use(compression());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
else app.use(morgan('combined'));

const limiter = rateLimit({
  max: 10000,
  windowMs: 1 * 60 * 60 * 1000, // Significa 1 hr
  message: 'Too many requests from this IP',
});

app.use(limiter);

app.use('/elektron/v1/users', usersRouter);
app.use('/elektron/v1/products', productsRouter);
app.use('/elektron/v1/cart', cartRouter);

app.use('*', globalErrorHandler);

module.exports = { app };
