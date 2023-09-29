const { default: mongoose } = require("mongoose");
const Order = require("../models/Order");

class OrderRepository {
  async create(order) {
    const createdOrder = await Order.create(order);

    return createdOrder.toObject();
  }

  async findById(orderId) {
    const order = await Order.findById(orderId).lean();

    return order;
  }

  async findAll() {
    const orders = await Order.find().lean();
    
    return orders;
  }

  async dbIsConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = OrderRepository;
