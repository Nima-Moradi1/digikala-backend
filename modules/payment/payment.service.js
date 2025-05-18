const { getUserBasketById } = require("../basket/basket.service");
const { Payment } = require("../payment/payment.model");
const { Order, OrderItem } = require("../order/order.model");
const { OrderStatus } = require("../../common/constant/order.const");
const { zarinpalRequest, zarinpalVerify } = require("../services/zarinpal.service");
const createHttpError = require("http-errors");
const { PaymentMessages } = require("./payment.messages");
const { Basket } = require("../basket/basket.model");

async function paymentBasketHandler(req, res, next) {
  try {
    const { id: userId = undefined } = req.user;
    const { finalAmount, finalBasket, totalAmount, totalDiscount } = await getUserBasketById(userId);
    const payment = await Payment.create({
      userId,
      amount: finalAmount,
      status: false,
    });
    const order = await Order.create({
      userId,
      paymentId: payment.id,
      total_amount: totalAmount,
      final_amount: finalAmount,
      discount_amount: totalDiscount,
      status: OrderStatus.Pending,
      address: "Tehran - SeyyedKhandan , Dabestan - k.Mahmoudi - P.15",
    });

    payment.orderId = order.id;
    let orderList = [];
    for (const item of finalBasket) {
      let items = [];
      if (item?.sizes?.length > 0) {
        items = item?.sizes?.map((size) => {
          return {
            orderId: order?.id,
            productId: item?.id,
            sizeId: size?.id,
            count: size?.count,
          };
        });
      } else if (item?.colors?.length > 0) {
        items = item?.colors?.map((color) => {
          return {
            orderId: order?.id,
            colorId: color?.id,
            productId: item?.id,
            count: color?.count,
          };
        });
      } else if (item?.colors?.length == 0 && item?.sizes?.length == 0) {
        items = [
          {
            orderId: order?.id,
            productId: item?.id,
            count: item?.count,
          },
        ];
      }
      console.log(...items);
      orderList.push(...items);
    }
    await OrderItem.bulkCreate(orderList);
    const result = await zarinpalRequest(payment?.amount, req?.user, "logging from payment service module");
    payment.authority = result?.authority;
    await payment.save();
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function verifyPaymentHandler(req, res, next) {
  try {
    //status : OK or NOK
    const { Authority, Status } = req.query;
    if (Status === "OK" && Authority) {
      const payment = await Payment.findOne({ where: { Authority } });
      if (!payment) {
        throw createHttpError(404, PaymentMessages.NOT_FOUND);
      }
      const result = await zarinpalVerify(payment?.amount, Authority);
      if (result) {
        //the number is test-based and not for production
        payment.refId = result?.ref_id ?? "213234782";
        const order = await Order.findByPk(payment.orderId);
        if (!order) {
          throw createHttpError(404, PaymentMessages.ORDER_NOT_FOUND);
        }
        order.status = OrderStatus.InProcess;
        await order.save();
        await payment.save();
        //if payment was successful, destroy and remove the cart so user knows he has payed the cart.
        await Basket.destroy({
          where: {
            userId: order?.userId,
          },
        });
        return res.redirect("http://localhost:3000/payment?status=success");
      } else {
        //e.g : if the payment was cancelled or had errors , we don't save it so user can go back to cart and pay again
        await Payment.destroy({
          where: {
            id: payment?.id,
          },
        });
        await Order.destroy({
          where: {
            id: payment?.orderId,
          },
        });
      }
    }
    return res.redirect("http://localhost:3000/payment?status=failure");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  paymentBasketHandler,
  verifyPaymentHandler,
};
