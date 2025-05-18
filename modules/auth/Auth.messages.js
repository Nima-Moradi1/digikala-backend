const AuthMessages = Object.freeze({
  NOT_FOUND: "account was not found!",
  SEND_SUCCESS: "otp code was sent successfully!",
  INVALID_CODE: "the otp code is not valid",
  EXPIRED_CODE: "otp code has expired, try again!",
  LOGIN_SUCCESS: "Successfully Logged In",
  REFRESH_TOKEN_ERROR: "error signing in : login to your account",
  TOKEN_INVALID: "token is not valid, try logging in again!",
});

module.exports = {
  AuthMessages,
};
