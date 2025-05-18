const { Router } = require("express");
const { sendOtpHandler, checkOtpHandler, verifyRefreshTokenHandler } = require("./auth.service");
const { AuthGuardMiddleware } = require("../auth/auth.guard");
const router = Router();

router.post("/send-otp", sendOtpHandler);
router.post("/check-otp", checkOtpHandler);
router.post("/refresh-token", verifyRefreshTokenHandler);
router.get("/check-login", AuthGuardMiddleware, (req, res, next) => {
  res.json(req?.user ?? {});
});

module.exports = {
  AuthRoutes: router,
};
