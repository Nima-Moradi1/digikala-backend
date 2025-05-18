const { Router } = require("express");
const { AuthGuardMiddleware } = require("../auth/auth.guard");
const { paymentBasketHandler, verifyPaymentHandler } = require("./payment.service");
const { zarinpalRequest } = require("../services/zarinpal.service");
const router = Router();

router.post("/create", AuthGuardMiddleware, paymentBasketHandler);
router.get("/callback", verifyPaymentHandler);

module.exports = {
  PaymentRoutes: router,
};
