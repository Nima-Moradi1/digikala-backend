const { default: axios } = require("axios");
const { config } = require("dotenv");
const createHttpError = require("http-errors");
const { PaymentMessages } = require("../payment/payment.messages");
config();

async function zarinpalRequest(amount, user, description = "buying a product") {
  const result = await axios
    .post(process.env.ZARINPAL_REQUEST_URL, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      callback_url: process.env.ZARINPAL_CALLBACK_URL,
      amount: amount * 10,
      description,
      metadata: {
        email: "",
        mobile: user?.mobile,
      },
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((result) => result.data)
    .catch((error) => console.log(error));
  if (result?.data?.authority) {
    return {
      authority: result?.data?.authority,
      payment_url: `${process.env.ZARINPAL_GATEWAY_URL}/${result?.data?.authority}`,
    };
  } else {
    throw createHttpError(400, PaymentMessages.ZARINPAL_ERROR);
  }
}

async function zarinpalVerify(amount, authority) {
  const result = await axios
    .post(process.env.ZARINPAL_VERIFY_URL, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      //change toman to Rial
      amount: amount * 10,
      authority,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((result) => result.data)
    .catch((error) => {
      return error;
    });
  // code 100 from zarinpal : verifying the payment for the first time
  if (result?.data?.code == 100) {
    return result?.data;
  } else if (result?.data?.code == 101) {
    throw createHttpError(409, PaymentMessages.ALREADY_VERIFIED);
  } else {
    throw createHttpError(400, PaymentMessages.ZARINPAL_ERROR);
  }
}

module.exports = {
  zarinpalRequest,
  zarinpalVerify,
};
