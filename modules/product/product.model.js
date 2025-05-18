const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize.config");
const { ProductTypes } = require("../../common/constant/product.const");

const Product = sequelize.define(
  "product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    //! Why did we allownull the price ? because this is for single products
    //! and other enums of products have their own price based on color or size
    price: { type: DataTypes.DECIMAL, allowNull: true },
    discount: { type: DataTypes.INTEGER, allowNull: true },
    active_discount: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
    // our products in digikala have 3 types > 1. they're a single product
    // 2. they're colored products ( products that has more than 1 color for it )
    // 3. they're sized products (products that have more than 1 size)
    //! since we want to have an array of strings in the enum , we use object.values
    type: { type: DataTypes.ENUM(...Object.values(ProductTypes)) },
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    description: { type: DataTypes.TEXT },
  },
  {
    // we don't normally use camelCase words for mySQL
    modelName: "product",
    freezeTableName: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const ProductDetail = sequelize.define(
  "product_detail",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING }, // مثال : مناسب برای
    value: { type: DataTypes.STRING }, // مثال :‌ پوست خشک
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: "product",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    modelName: "product_detail",
  }
);

const ProductColor = sequelize.define(
  "product_color",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    color_name: { type: DataTypes.STRING },
    color_code: { type: DataTypes.STRING },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: "product",
        key: "id",
      },
    },
    // each color can have different discount or price or count (in digikala)
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: { type: DataTypes.DECIMAL, defaultValue: 0 },
    discount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
    active_discount: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    timestamps: false,
    modelName: "product_color",
  }
);

const ProductSize = sequelize.define(
  "product_size",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    size: { type: DataTypes.STRING },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: "product",
        key: "id",
      },
    },
    // each color can have different discount or price or count (in digikala)
    count: { type: DataTypes.INTEGER, defaultValue: 0 },
    price: { type: DataTypes.DECIMAL, defaultValue: 0 },
    discount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
    active_discount: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    timestamps: false,
    modelName: "product_size",
  }
);

module.exports = {
  Product,
  ProductColor,
  ProductDetail,
  ProductSize,
};
