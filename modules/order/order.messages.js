const OrderMessages = Object.freeze({
  INCORRECT_STATUS: "Status is not correct!",
  NOT_FOUND_ORDER: "no order with this id was found!",
  EMPTY_ID_PARAMS: "please include the orderId in params!",
  IN_PROCESS_ERROR: "Order Status must be inProcess",
  TRANSIT_ERROR: "Order Status must be InTransit",
  PACKING_ERROR: "Order Status must be in Packing",
  CANCEL_ERROR: "Order cannot be deleted in these stages : (delivery,pending,canceled)",
  IN_PROCESS_TO_PACKING_SUCCESS: "the order status successfully changed from process area to packing stage!",
  PACKING_TO_TRANSIT_SUCCESS: "the order status successfully changed from packing stage to the transit area!",
  TRANSIT_TO_DELIVERY_SUCCESS: "the order status successfully changed from transit area to delivery stage!",
  CANCEL_ORDER_SUCCESS: "the order status changed to canceled and the order does not exist anymore",
});

module.exports = {
  OrderMessages,
};
