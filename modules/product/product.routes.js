const { Router } = require("express");
const {
  createProductHandler,
  getProductHandler,
  getProductDetailByIdHandler,
  removeProductHandler,
} = require("./product.service");
const { createProductValidation } = require("./validation");

const router = Router();

router.post("/create", createProductValidation, createProductHandler);
router.get("/get", getProductHandler);
router.get("/get/:id", getProductDetailByIdHandler);
router.delete("/delete/:id", removeProductHandler);

module.exports = {
  ProductRoutes: router,
};
