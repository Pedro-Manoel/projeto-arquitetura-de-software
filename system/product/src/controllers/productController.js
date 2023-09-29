const uuid = require('uuid');

const ProductMessageBroker = require("../utils/ProductMessageBroker");
const Product = require("../models/Product");
const config = require('../config');
const ProductService = require('../services/ProductService');

class ProductController {

  constructor() {
    this.productService = new ProductService();
    this.ordersMap = new Map();

  }

  async createProduct(req, res) {
    try {
      const product = new Product(req.body);

      const validationError = product.validateSync();

      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      const createdProduct = await this.productService.createProduct(product);

      res.status(201).json(createdProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res) {
    try {  
      const { ids } = req.body;
      const products = await this.productService.getProducts(ids);

      const orderId = uuid.v4();
      this.ordersMap.set(orderId, { 
        status: "pending", 
        products, 
        username: req.user.username
      });
  
      await ProductMessageBroker.publishMessage({
        products,
        username: req.user.username,
        orderId,
      });

      console.log(`Publishing PENDING ORDER with id: ${orderId}`);

      ProductMessageBroker.consumeMessage((data) => {
        const { orderId } = data;
        console.log(`Consuming COMPLETE ORDER with id: ${orderId}`);
        const order = this.ordersMap.get(orderId);
        if (order) {
          this.ordersMap.set(orderId, { ...order, ...data, status: 'completed' });
        }
      });
  
      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        order = this.ordersMap.get(orderId);
      }
  
      this.ordersMap.delete(orderId);
      return res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  

  async getProducts(_, res, _2) {
    try {
      const products = await this.productService.getProducts();

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async healthCheck(_, res) {
    try {
      const [mongodbUp, rabbitmqUp] = await Promise.all([
        this.productService.dbIsConnected(),
        ProductMessageBroker.isConnected(),
      ]);

      const status = mongodbUp && rabbitmqUp;

      const healthcheck = {
        status: status ? "UP" : "DOWN",
        timestamp: Date.now(),
        checks: [
          {
            name: "MongoDB",
            status: mongodbUp ? "UP" : "DOWN",
          },
          {
            name: "RabbitMQ",
            status: rabbitmqUp ? "UP" : "DOWN",
          }
        ]
      };

      res.status(status ? 200 : 400).json(healthcheck);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
