const createHttpError = require("http-errors");
const { User, Otp } = require("../user/user.model");
const { AuthMessages } = require("./Auth.messages");
const { config } = require("dotenv");
const jwt = require("jsonwebtoken");
const { RefreshTokenModel } = require("../user/refreshToken.model");
config();

async function sendOtpHandler(req, res, next) {
  try {
    const { mobile } = req.body;
    let code = Math.floor(Math.random() * 99999 - 10000) + 10000;
    let user = await User.findOne({
      where: { mobile },
    });
    let otp = null;
    if (!user) {
      user = await User.create({
        mobile,
      });
      otp = await Otp.create({
        code,
        expires_in: new Date(Date.now() + 1000 * 60),
        userId: user.id,
      });
      return res.json({
        message: AuthMessages.SEND_SUCCESS,
        code,
      });
    } else {
      otp = await Otp.findOne({ where: { userId: user?.id } });
      otp.code = code;
      otp.expires_in = new Date(Date.now() + 1000 * 60);
      await otp.save();
      return res.json({
        message: AuthMessages.SEND_SUCCESS,
        code,
      });
    }
  } catch (error) {
    next(error);
  }
}

async function checkOtpHandler(req, res, next) {
  try {
    const { mobile, code } = req.body;
    let user = await User.findOne({
      where: { mobile },
      include: [{ model: Otp, as: "otp" }],
    });
    if (!user) {
      throw createHttpError(401, AuthMessages.NOT_FOUND);
    }
    if (user?.otp?.code !== code) {
      throw createHttpError(401, AuthMessages.INVALID_CODE);
    }
    if (user?.otp?.expires_in < new Date()) {
      throw createHttpError(401, AuthMessages.EXPIRED_CODE);
    }
    const { accessToken, refreshToken } = await generateTokenHandler({ userId: user?.id });
    return res.json({
      message: AuthMessages.LOGIN_SUCCESS,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

async function generateTokenHandler(payload) {
  const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
  return {
    accessToken,
    refreshToken,
  };
}

// If accessToken was expired, we send a req to this function to make a new one for both
async function verifyRefreshTokenHandler(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      throw createHttpError(401, AuthMessages.REFRESH_TOKEN_ERROR);
    }
    const verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    // upper, we passed the userId as the payload to the generateToken,so based on that
    // we know if the token has been generated , it contains the userId
    if (verifiedToken?.userId) {
      //first, we check if the token is already in the database > if the user sends req to the already existing refreshToken in database, he's probably a programmer or a hacker
      const existCheck = await RefreshTokenModel.findOne({
        where: {
          token,
        },
      });
      if (existCheck) {
        throw createHttpError(401, AuthMessages.TOKEN_INVALID);
      }
      const user = await User.findByPk(verifiedToken?.userId);
      if (!user) {
        throw createHttpError(401, AuthMessages.REFRESH_TOKEN_ERROR);
      }
      const { accessToken, refreshToken } = await generateTokenHandler({ userId: user?.id });
      await RefreshTokenModel.create({
        token,
        userId: user?.id,
      });
      return res.json({
        refreshToken,
        accessToken,
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendOtpHandler,
  checkOtpHandler,
  verifyRefreshTokenHandler,
  generateTokenHandler,
};
