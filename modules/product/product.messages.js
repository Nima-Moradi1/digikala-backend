const ProductMessages = Object.freeze({
  CREATED: "Product Created Successfully !",
  REMOVED: "Producted was Successfully Deleted!",
  NOT_FOUND: "No Product was Found!",
  INVALID: "Invalid Product Type",
  COLOR_NOT_FOUND: "no color was found",
  SIZE_NOT_FOUND: "no size was found !",
  EMPTY_COLOR: "Send your product color details",
  EMPTY_SIZE: "Send your product size details",
  COLOR_OUT_OF_STOCK: "this color is not available in stock at the moment",
  SIZE_OUT_OF_STOCK: "this size is not available in stock at the moment",
  PRODUCT_OUT_OF_STOCK: "this product is not available in stock at the moment",
});

module.exports = {
  ProductMessages,
};
