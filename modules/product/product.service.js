const createHttpError = require("http-errors");
const { ProductTypes } = require("../../common/constant/product.const");
const { Product, ProductDetail, ProductColor, ProductSize } = require("./product.model");
const { ProductMessages } = require("./product.messages");

async function createProductHandler(req, res, next) {
  try {
    const {
      title,
      description,
      details,
      type,
      // if the product type is not Single , these 4 can be undefined
      price = undefined,
      discount = undefined,
      count = undefined,
      active_discount = undefined,
      colors,
      sizes,
    } = req.body;

    // first we make sure the product type is correct :
    if (!Object.values(ProductTypes).includes(type)) {
      throw createHttpError(400, ProductMessages.INVALID);
    }
    // the same details every product can have (even Single type) :
    const product = await Product.create({
      title,
      description,
      price,
      discount,
      active_discount,
      type,
      count,
    });

    if (details && Array.isArray(details)) {
      const detailList = [];
      for (const item of details) {
        detailList.push({
          key: item.key,
          value: item.value,
          productId: product.id,
        });
      }
      // so if we had anything in the detailList , it means we can save it :
      if (detailList.length > 0) {
        await ProductDetail.bulkCreate(detailList);
      }
    }
    // now based on the product type , we recieve what we want :
    if (type === ProductTypes.Coloring) {
      if (colors && Array.isArray(colors)) {
        const colorList = [];
        for (const item of colors) {
          colorList.push({
            color_code: item.code,
            color_name: item.name,
            price: item.price,
            discount: item.discount,
            active_discount: item.active_discount,
            count: item.count,
            productId: product.id,
          });
        }
        // so if we had anything in the colorList , it means we can save it :
        if (colorList.length > 0) {
          await ProductColor.bulkCreate(colorList);
        }
      }
    }
    if (type === ProductTypes.Sizing) {
      if (sizes && Array.isArray(sizes)) {
        const sizeList = [];
        for (const item of sizes) {
          sizeList.push({
            size: item.size,
            price: item.price,
            discount: item.discount,
            active_discount: item.active_discount,
            count: item.count,
            productId: product.id,
          });
        }
        // so if we had anything in the sizeList , it means we can save it :
        if (sizeList.length > 0) {
          await ProductSize.bulkCreate(sizeList);
        }
      }
    }
    return res.json({
      message: ProductMessages.CREATED,
    });
  } catch (err) {
    next(err);
  }
}
async function getProductHandler(req, res, next) {
  try {
    const products = await Product.findAll({});
    return res.json(products);
  } catch (error) {
    next(error);
  }
}
async function getProductDetailByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      where: { id },
      include: [
        { model: ProductDetail, as: "details" },
        { model: ProductColor, as: "colors" },
        { model: ProductSize, as: "sizes" },
      ],
    });
    if (!product) throw createHttpError(404, ProductMessages.NOT_FOUND);
    return res.json({
      product,
    });
  } catch (error) {
    next(error);
  }
}
async function removeProductHandler(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) throw createHttpError(404, ProductMessages.NOT_FOUND);
    await product.destroy();
    return res.json({
      message: ProductMessages.REMOVED,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProductHandler,
  getProductHandler,
  getProductDetailByIdHandler,
  removeProductHandler,
};
