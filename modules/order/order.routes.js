const { Router } = require("express");
const {
  getMyOrdersHandler,
  getOrderByIdHandler,
  setPackingStatusToOrder,
  setTransitStatusToOrder,
  setDeliveryStatusToOrder,
  setCanceledStatusToOrder,
} = require("./order.service");
const { AuthGuardMiddleware } = require("../auth/auth.guard");

const router = Router();

router.get("/get", AuthGuardMiddleware, getMyOrdersHandler);
router.get("/get/:id", AuthGuardMiddleware, getOrderByIdHandler);
router.patch("/set-packed/:id", AuthGuardMiddleware, setPackingStatusToOrder);
router.patch("/set-transit/:id", AuthGuardMiddleware, setTransitStatusToOrder);
router.patch("/set-delivered/:id", AuthGuardMiddleware, setDeliveryStatusToOrder);
router.patch("/set-canceled/:id", AuthGuardMiddleware, setCanceledStatusToOrder);

module.exports = {
  OrderRoutes: router,
};
