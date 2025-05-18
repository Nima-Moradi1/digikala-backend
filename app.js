const express = require("express");
const dotenv = require("dotenv");
const initDatabase = require("./config/models.initial");
const { ProductRoutes } = require("./modules/product/product.routes");
const { AuthRoutes } = require("./modules/auth/auth.routes");
const { BasketRoutes } = require("./modules/basket/basket.routes");
const { PaymentRoutes } = require("./modules/payment/payment.routes");
const { OrderRoutes } = require("./modules/order/order.routes");
const { RbackRoutes } = require("./modules/RBAC/rback.routes");
dotenv.config();

async function main() {
  //express configs
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //sql connection and initialization
  await initDatabase();
  //routes
  app.use("/product", ProductRoutes);
  app.use("/auth", AuthRoutes);
  app.use("/cart", BasketRoutes);
  app.use("/payment", PaymentRoutes);
  app.use("/orders", OrderRoutes);
  app.use("/rbac", RbackRoutes);
  //not-found page
  app.use((req, res, next) => {
    return res.status(400).json({
      message: "not found route",
    });
  });
  // error-handling
  app.use((err, req, res, next) => {
    const status = err?.status ?? err.statusCode ?? 500;
    let message = err?.message ?? "Internal Server Error!";
    if (err?.name === "ValidationError") {
      const { details } = err;
      message = details?.body[0]?.message ?? "Internal Server Error !";
    }
    return res.status(status).json({
      message,
    });
  });
  //running the app on port
  const port = process.env.PORT ?? 3000;
  app.listen(port, () => {
    console.log(`Server Running locally on Port ${port}`);
  });
}

main();
