const { config } = require("dotenv");
const { User } = require("../user/user.model");
const { AuthMessages } = require("./Auth.messages");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
config();

async function AuthGuardMiddleware(req, res, next) {
  try {
    const authorization = req?.headers?.authorization ?? undefined;
    if (!authorization) {
      throw createHttpError(401, AuthMessages.REFRESH_TOKEN_ERROR);
    }
    const [bearer, token] = authorization?.split(" ");
    if (!bearer || !authorization?.includes("bearer")) {
      throw createHttpError(401, AuthMessages.TOKEN_INVALID);
    }
    const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // upper, we passed the userId as the payload to the generateToken,so based on that
    // we know if the token has been generated , it contains the userId
    if (verifiedToken?.userId) {
      const user = await User.findByPk(verifiedToken?.userId);
      if (!user) {
        throw createHttpError(401, AuthMessages.REFRESH_TOKEN_ERROR);
      }
      req.user = {
        id: user?.id,
        mobile: user?.mobile,
        fullname: user?.fullname,
      };
      // !this is a middleware to check the validity of a request based on accessToken
      // ! so we do not need to send any response !
      return next();
    }
    throw createHttpError(401, AuthMessages.TOKEN_INVALID);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  AuthGuardMiddleware,
};
