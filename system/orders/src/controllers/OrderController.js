const OrderService = require('../services/OrderService');
const OrderMessageBroker = require('../utils/OrderMessageBroker');


class OrderController {

  constructor() {
    this.orderService = new OrderService();
  }

  async getOrders(_, res, _2) {
    try {
      const orders = await this.orderService.getOrders();

      res.status(200).json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async healthCheck(_, res) {
    try {
      const [mongodbUp, rabbitmqUp] = await Promise.all([
        this.orderService.dbIsConnected(),
        OrderMessageBroker.isConnected(),
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

module.exports = OrderController;
