const express = require("express");
const ProductController = require("../controllers/ProductController");

const ensureAuthenticate = require("../middlewares/ensureAuthenticate");

const router = express.Router();
const productController = new ProductController();

router.post("/", ensureAuthenticate, (req, res) => productController.createProduct(req, res));
router.get("/", ensureAuthenticate, (req, res) => productController.getProducts(req, res));
router.post("/buy", ensureAuthenticate, (req, res) => productController.createOrder(req, res));
router.get("/health", (req, res) => productController.healthCheck(req, res));
router.get("/:id", ensureAuthenticate, (req, res) => productController.getProductById(req, res));



module.exports = router;
