const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const OrderMessageBroker = require("./utils/OrderMessageBroker");
const OrderService = require("./services/OrderService");
const OrdersRoutes = require("./routes");


class App {
  constructor() {
    this.app = express();
    this.orderService = new OrderService();
  }

  async connectDB() {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(config.mongodbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("MongoDB connected");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.use("/orders", OrdersRoutes);
  }

  async setupMessageBroker() {
    return OrderMessageBroker.connect();
  }

  async orderConsumer() {  
    try {
      this.orderService.processOrder();
    } catch (err) {
      console.error(err.message);
    }
  }

  async setup() {
    await Promise.all([this.connectDB(), this.setupMessageBroker()]);
    this.setMiddlewares();
    this.setRoutes();
    this.orderConsumer();
  }

  async start() {
    await this.setup();

    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }
}

module.exports = App;
