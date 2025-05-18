const { Router } = require("express");
const { addToBasketHandler, getUserBasketHandler } = require("./basket.service");
const { AuthGuardMiddleware } = require("../auth/auth.guard");

const router = Router();

router.post("/add", AuthGuardMiddleware, addToBasketHandler);
router.get("/get", AuthGuardMiddleware, getUserBasketHandler);

module.exports = {
  BasketRoutes: router,
};
