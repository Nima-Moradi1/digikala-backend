// this file is for making the RELATIONS  between Models and how to connect them to each other

const sequelize = require("./sequelize.config");
const { Product, ProductDetail, ProductColor, ProductSize } = require("../modules/product/product.model");
const { User, Otp } = require("../modules/user/user.model");
const { RefreshTokenModel } = require("../modules/user/refreshToken.model");
const { Basket } = require("../modules/basket/basket.model");
const { Discount } = require("../modules/discount/discount.model");
const { Order, OrderItem } = require("../modules/order/order.model");
const { Payment } = require("../modules/payment/payment.model");
const { Role, RolePermission, Permission } = require("../modules/RBAC/rbac.model");

async function initDatabase() {
  Product.hasMany(ProductDetail, { foreignKey: "productId", sourceKey: "id", as: "details" });
  ProductDetail.belongsTo(Product, { foreignKey: "productId", targetKey: "id" });

  Product.hasMany(ProductColor, { foreignKey: "productId", sourceKey: "id", as: "colors" });
  ProductColor.belongsTo(Product, { foreignKey: "productId", targetKey: "id" });

  Product.hasMany(ProductSize, { foreignKey: "productId", sourceKey: "id", as: "sizes" });
  ProductSize.belongsTo(Product, { foreignKey: "productId", targetKey: "id" });
  User.hasOne(Otp, { foreignKey: "userId", as: "otp", sourceKey: "id" });
  Otp.hasOne(User, { foreignKey: "otpId", as: "otp", sourceKey: "id" });
  Otp.belongsTo(User, { foreignKey: "userId", targetKey: "id" });

  Product.hasMany(Basket, { foreignKey: "productId", sourceKey: "id", as: "basket" });
  ProductColor.hasMany(Basket, { foreignKey: "colorId", sourceKey: "id", as: "basket" });
  ProductSize.hasMany(Basket, { foreignKey: "sizeId", sourceKey: "id", as: "basket" });
  User.hasMany(Basket, { foreignKey: "userId", sourceKey: "id", as: "basket" });
  Discount.hasMany(Basket, { foreignKey: "discountId", sourceKey: "id", as: "basket" });

  Basket.belongsTo(Product, { foreignKey: "productId", targetKey: "id", as: "product" });
  Basket.belongsTo(User, { foreignKey: "userId", targetKey: "id", as: "user" });
  Basket.belongsTo(ProductColor, { foreignKey: "colorId", targetKey: "id", as: "color" });
  Basket.belongsTo(ProductSize, { foreignKey: "sizeId", targetKey: "id", as: "size" });
  Basket.belongsTo(Discount, { foreignKey: "discountId", targetKey: "id", as: "discount" });

  Order.hasMany(OrderItem, { foreignKey: "orderId", sourceKey: "id", as: "items" });
  User.hasMany(Order, { foreignKey: "userId", sourceKey: "id", as: "orders" });
  OrderItem.belongsTo(Order, { foreignKey: "orderId", targetKey: "id" });
  OrderItem.belongsTo(Product, { foreignKey: "productId", targetKey: "id", as: "product" });
  OrderItem.belongsTo(ProductColor, { foreignKey: "colorId", targetKey: "id", as: "color" });
  OrderItem.belongsTo(ProductSize, { foreignKey: "sizeId", targetKey: "id", as: "size" });

  User.hasMany(Payment, { foreignKey: "userId", sourceKey: "id", as: "payments" });
  Order.hasOne(Payment, { foreignKey: "orderId", as: "payment", sourceKey: "id", onDelete: "CASCADE" });
  Payment.hasOne(Order, { foreignKey: "paymentId", as: "order", sourceKey: "id", onDelete: "CASCADE" });

  Role.hasMany(RolePermission, { foreignKey: "roleId", sourceKey: "id", as: "permissions" });
  Permission.hasMany(RolePermission, { foreignKey: "permissionId", sourceKey: "id", as: "roles" });
  Role.hasMany(Permission, { foreignKey: "nId", sourceKey: "id" });
  RolePermission.belongsTo(Role, { foreignKey: "roleId", targetKey: "id" });
  RolePermission.belongsTo(Permission, { foreignKey: "permissionId", targetKey: "id" });
  // RefreshTokenModel.sync();
  // Discount.sync({});
  // Basket.sync({});
  // Order.sync({});
  // OrderItem.sync({});
  // Payment.sync({});
  //! force: delete and re-write the whole database everytime we refresh
  //! alter : just checks for any new tables or relations and create them without re-writing others
  // await sequelize.sync({ alter: true });
}

module.exports = initDatabase;
