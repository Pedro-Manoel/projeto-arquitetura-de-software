require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const config = require("./config");
const ProductMessageBroker = require("./utils/ProductMessageBroker");
const ProductRoutes = require("./routes");

class App {
  constructor() {
    this.app = express();
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
    this.app.use("/products", ProductRoutes);
  }

  async setupMessageBroker() {
    return ProductMessageBroker.connect();
  }

  async setup() {
    await Promise.all([this.connectDB(), this.setupMessageBroker()]);
    this.setMiddlewares();
    this.setRoutes();
  }

  async start() {
    await this.setup();

    this.server = this.app.listen(config.port, () =>
      console.log(`Product service on port ${config.port}`)
    );
  }
}

module.exports = App;
