const createHttpError = require("http-errors");
const { OrderStatus } = require("../../common/constant/order.const");
const { OrderMessages } = require("./order.messages");
const { Order, OrderItem } = require("./order.model");
const { Product, ProductColor, ProductSize } = require("../product/product.model");

async function getMyOrdersHandler(req, res, next) {
  try {
    const { id: userId } = req.user;
    const { status } = req.query;
    if (!status || !Object.values(OrderStatus).includes(status)) {
      throw createHttpError(400, OrderMessages.INCORRECT_STATUS);
    }
    const orders = await Order.findAll({
      //Make sure to include userId to get the orders of the user, not all the order with that status!
      where: { status, userId },
    });
    return res.json({ orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderByIdHandler(req, res, next) {
  try {
    const { id: userId } = req.user;
    const { id } = req.params;
    if (!id) {
      throw createHttpError(400, OrderMessages.EMPTY_ID_PARAMS);
    }
    const order = await Order.findOne({
      where: {
        //checks the order by id to be for the userId, not anyone else.
        id,
        userId,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: Product, as: "product" },
            { model: ProductColor, as: "color" },
            { model: ProductSize, as: "size" },
          ],
        },
      ],
    });
    if (!order) {
      throw createHttpError(404, OrderMessages.NOT_FOUND_ORDER);
    }
    return res.json({ order });
  } catch (error) {
    next(error);
  }
}

async function setPackingStatusToOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = Order.findByPk(id);
    if (!order) {
      throw createHttpError(404, OrderMessages.NOT_FOUND_ORDER);
    }
    // ما میخوایم اول چک کنیم ببینیم سفارش ما توی حالت پردازش هست یا نه
    // اگر بود تازه بعدش میخوایم ببریم توی حالت بسته بندی که بره مرحله بعدی
    if (order.status !== OrderStatus.InProcess) {
      throw createHttpError(400, OrderMessages.IN_PROCESS_ERROR);
    }
    order.status = OrderStatus.Packing;
    await order.save();
    return res.json({
      message: OrderMessages.IN_PROCESS_TO_PACKING_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
}
async function setTransitStatusToOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = Order.findByPk(id);
    if (!order) {
      throw createHttpError(404, OrderMessages.NOT_FOUND_ORDER);
    }
    if (order.status !== OrderStatus.Packing) {
      throw createHttpError(400, OrderMessages.PACKING_ERROR);
    }
    order.status = OrderStatus.InTransit;
    await order.save();
    return res.json({
      message: OrderMessages.PACKING_TO_TRANSIT_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
}
async function setCanceledStatusToOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = Order.findByPk(id);
    if (!order) {
      throw createHttpError(404, OrderMessages.NOT_FOUND_ORDER);
    }
    //we cannot cancel an order in 3 stages :
    //1. an order that is pending (not even paid yet)
    //2. an order that has been delivered (delivery stage)
    //3. an order that has already been canceled before
    if (
      [OrderStatus.Delivered, OrderStatus.Pending, OrderStatus.Canceled].includes(order.status) == OrderStatus.Delivered
    ) {
      throw createHttpError(400, OrderMessages.CANCEL_ERROR);
    }
    order.status = OrderStatus.Canceled;
    order.reason = reason;
    await order.save();
    return res.json({
      message: OrderMessages.CANCEL_ORDER_SUCCESS,
      reason,
    });
  } catch (error) {
    next(error);
  }
}
async function setDeliveryStatusToOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = Order.findByPk(id);
    if (!order) {
      throw createHttpError(404, OrderMessages.NOT_FOUND_ORDER);
    }
    if (order.status !== OrderStatus.InTransit) {
      throw createHttpError(400, OrderMessages.TRANSIT_ERROR);
    }
    order.status = OrderStatus.Delivered;
    await order.save();
    return res.json({
      message: OrderMessages.TRANSIT_TO_DELIVERY_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyOrdersHandler,
  getOrderByIdHandler,
  setPackingStatusToOrder,
  setTransitStatusToOrder,
  setCanceledStatusToOrder,
  setDeliveryStatusToOrder,
};
