 const { Cart } = require('./cartModel');
const { Order } = require('./ordersModel');
const { ProductsInCart } = require('./productsInCartModel.js');
const { Products } = require("./productsModel");
const { User } = require("./usersModel");
const { Category } = require("./categoriesModel");

const initRelations = () => {
    User.hasMany(Order);
  Order.belongsTo(User);

    User.hasOne(Cart);
  Cart.belongsTo(User);

  User.hasMany(Products);
  Products.belongsTo(User);

     Cart.hasOne(Order);
  Order.belongsTo(Cart);

  Cart.hasMany(ProductsInCart);
  ProductsInCart.belongsTo(Cart);

  Products.hasOne(ProductsInCart);
  ProductsInCart.belongsTo(Products);

  Category.hasOne(Products);
  Products.belongsTo(Category);
};

module.exports = { initRelations };
