const express = require("express");
const OrderController = require("../controllers/OrderController");

const ensureAuthenticate = require("../middlewares/ensureAuthenticate");

const router = express.Router();
const orderController = new OrderController();

router.get("/", ensureAuthenticate, (req, res) => orderController.getOrders(req, res));
router.get("/health", (req, res) => orderController.healthCheck(req, res));


module.exports = router;
