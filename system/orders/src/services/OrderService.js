const Order = require("../models/Order");
const OrderRepository = require("../repositories/OrderRepository");
const OrderMessageBroker = require("../utils/OrderMessageBroker");

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async createOrder(order) {
    const createdOrder = await this.orderRepository.create(order);

    return createdOrder;
  }

  async getOrderById(orderId) {
    const order = await this.orderRepository.findById(orderId);

    return order;
  }

  async getOrders() {
    const orders = await this.orderRepository.findAll();

    return orders;
  }

  async processOrder() {
    while(OrderMessageBroker.channel === null) {
      console.log("Waiting for RabbitMQ connection...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    try {
      OrderMessageBroker.consumeMessage(async (data) => {
        console.log(`Consuming PENDING ORDER with id: ${data.orderId}`);
        const { products, username, orderId } = data;

        const newOrder = new Order({
          products,
          user: username,
          totalPrice: products.reduce((acc, product) => acc + product.price, 0),
        });

        await this.createOrder(newOrder);

        const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
        await OrderMessageBroker.publishMessage({ orderId, user, products: savedProducts, totalPrice })
        console.log(`Publishing COMPLETE ORDER with id: ${orderId}`)
      });
    } catch (err) {
      console.error("Error in ORDER", err.message);
    }
  }

  async dbIsConnected() {
    return this.orderRepository.dbIsConnected();
  }
}

module.exports = OrderService;
