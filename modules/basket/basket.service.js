const createHttpError = require("http-errors");
const { Product, ProductColor, ProductSize } = require("../../modules/product/product.model");
const { ProductMessages } = require("../../modules/product/product.messages");
const { ProductTypes } = require("../../common/constant/product.const");
const { Basket } = require("../basket/basket.model");
const { BasketMessages } = require("./basket.messages");

async function addToBasketHandler(req, res, next) {
  try {
    const { id = undefined } = req.user ?? {};
    const { productId, sizeId, colorId } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) {
      throw createHttpError(404, ProductMessages.NOT_FOUND);
    }
    const basketItem = {
      productId: product?.id,
      userId: id,
    };
    //at first, we don't have the count from req, so we should check each one for availability in stock too!
    let productCount = undefined;
    let colorCount = undefined;
    let sizeCount = undefined;
    if (product.type === ProductTypes.Coloring) {
      //we may not recieve any colorId from frontend in request
      if (!colorId) throw createHttpError(400, ProductMessages.EMPTY_COLOR);
      const productColor = await ProductColor.findByPk(colorId);
      //we have recieved colorId,but it may not exist in the database
      if (!productColor) throw createHttpError(404, ProductMessages.COLOR_NOT_FOUND);
      //in this point here, we're sure that the colorId is recieved and it's validated in db, so we add the colorId to basketItem
      basketItem["colorId"] = colorId;
      //we check for count of the color in stock
      colorCount = productColor?.count ?? 0;
      if (colorCount === 0) {
        throw createHttpError(400, ProductMessages.COLOR_OUT_OF_STOCK);
      }
      // we do the same logic to Sizing as the Coloring above
    } else if (product.type === ProductTypes.Sizing) {
      if (!sizeId) throw createHttpError(400, ProductMessages.EMPTY_SIZE);
      const productSize = await ProductSize.findByPk(sizeId);
      if (!productSize) throw createHttpError(404, ProductMessages.SIZE_NOT_FOUND);
      basketItem["sizeId"] = sizeId;
      sizeCount = productSize?.count ?? 0;
      if (sizeCount === 0) {
        throw createHttpError(400, ProductMessages.SIZE_OUT_OF_STOCK);
      }
      //if the product is neither Sizing nor Coloring, it's a single Product :
    } else {
      if (productCount === 0) {
        productCount = product?.count ?? 0;
        throw createHttpError(400, ProductMessages.PRODUCT_OUT_OF_STOCK);
      }
    }
    // we check if we already have a basket of the similiar product(s), if so, add one to the count!
    const basket = await Basket.findOne({
      where: basketItem,
    });
    if (basket) {
      //NOTICE >> the count of a color or size or single-product should be bigger than the count user has requested from frontend
      if (sizeCount && sizeCount > basket?.count) {
        basket.count += 1;
      } else if (colorCount && colorCount > basket?.count) {
        basket.count += 1;
      } else if (productCount && productCount > basket?.count) {
        basket.count += 1;
      } else {
        throw createHttpError(400, ProductMessages.PRODUCT_OUT_OF_STOCK);
      }
      await basket.save();
    } else {
      await Basket.create({
        ...basketItem,
        count: 1,
      });
    }
    return res.json({
      message: BasketMessages.ADDED_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserBasketHandler(req, res, next) {
  try {
    const { id: userId = undefined } = req.user ?? {};
    const result = await getUserBasketById(userId);
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getUserBasketById(id) {
  const basket = await Basket.findAll({
    where: {
      userId: id,
    },
    //relation
    include: [
      {
        model: Product,
        as: "product",
      },
      {
        model: ProductColor,
        as: "color",
      },
      {
        model: ProductSize,
        as: "size",
      },
    ],
  });
  if (basket.length === 0) {
    throw createHttpError(400, BasketMessages.EMPTY_BASKET);
  }
  let totalAmount = 0;
  let totalDiscount = 0;
  let finalAmount = 0;
  let finalBasket = [];
  for (const item of basket) {
    const { product, color, size, count } = item;
    //! Important : in database , one user can have 3 records of one single product in the basket >
    //! we don't wanna show the user 3 records of basket for a single product, so we should do this :
    //1. find the index of the products in the basket with the same productId :
    let productIndex = finalBasket.findIndex((item) => item.id === product.id);
    //2. now find the products :
    let productData = finalBasket.find((item) => item.id === product.id);
    if (!productData) {
      productData = {
        id: product?.id,
        title: product?.title,
        price: product?.type,
        count,
        type: product?.type,
        sizes: [],
        colors: [],
      };
    } else {
      productData.count += count;
    }
    if (product?.type === ProductTypes.Coloring && color) {
      let price = color?.price * count;
      totalAmount += price;
      let discountAmount = 0;
      // this is the final price of the product wit coloring type (not the final price of the basket)
      let finalPrice = price;
      if (color?.active_discount && color?.discount > 0) {
        //we retrieve the amount of a percentage discount :
        discountAmount = price * (color?.discount / 100);
        totalDiscount += discountAmount;
      }
      finalPrice = price - discountAmount;
      //then we add the final price of the coloring product to the final amount of the basket here
      finalAmount += finalPrice;
      //finally,push all the necessary data to the productData that we will later show to the user
      productData["colors"].push({
        id: color?.id,
        color_name: color?.color_name,
        color_code: color?.color_code,
        price,
        discountAmount,
        finalPrice,
        count,
      });
    } else if (product?.type === ProductTypes.Sizing && size) {
      let price = size?.price * count;
      totalAmount += price;
      let discountAmount = 0;
      // this is the final price of the product wit coloring type (not the final price of the basket)
      let finalPrice = price;
      if (size?.active_discount && size?.discount > 0) {
        //we retrieve the amount of a percentage discount :
        discountAmount = price * (size?.discount / 100);
        totalDiscount += discountAmount;
      }
      finalPrice = price - discountAmount;
      //then we add the final price of the sizing product to the final amount of the basket here
      finalAmount += finalPrice;
      //finally,push all the necessary data to the productData that we will later show to the user
      productData["sizes"].push({
        id: size?.id,
        size: size?.size,
        price,
        discountAmount,
        finalPrice,
        count,
      });
    } else if (product?.type === ProductTypes.Single && product) {
      let price = product?.price * count;
      totalAmount += price;
      let discountAmount = 0;
      // this is the final price of the product wit coloring type (not the final price of the basket)
      let finalPrice = price;
      if (product?.active_discount && product?.discount > 0) {
        //we retrieve the amount of a percentage discount :
        discountAmount = price * (product?.discount / 100);
        totalDiscount += discountAmount;
      }
      finalPrice = price - discountAmount;
      //then we add the final price of the single product to the final amount of the basket here
      finalAmount += finalPrice;
      productData["finalPrice"] = finalPrice;
      productData["discountAmount"] = discountAmount;
    }
    if (productIndex > -1) finalBasket[productIndex] = productData;
    else finalBasket.push(productData);
  }
  return {
    totalAmount,
    totalDiscount,
    finalAmount,
    finalBasket,
  };
}

module.exports = {
  addToBasketHandler,
  getUserBasketHandler,
  getUserBasketById,
};
