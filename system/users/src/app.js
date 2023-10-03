const express = require("express");
const mongoose = require("mongoose");

const config = require("./config");

const UserRoutes = require("./routes");

class App {
  constructor() {
    this.app = express();
  }

  async connectDB() {
    console.log("Connecting to MongoDB...");

    while (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(config.mongodbUrl, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
      } catch (error) {
        console.log(`MongoDB connection error ${error.message}, retrying...`);
      }
    }
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.use("/users", UserRoutes);
  }

  async setup() {
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
  }

  async start() {
    await this.setup();
    this.server = this.app.listen(config.port, () => console.log(`User service on port ${config.port}`));
  }
}

module.exports = App;
