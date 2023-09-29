require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  userServiceUrl: process.env.USER_SERVICE_URL,
  productServiceUrl: process.env.PRODUCT_SERVICE_URL,
  orderServiceUrl: process.env.ORDER_SERVICE_URL,
};
