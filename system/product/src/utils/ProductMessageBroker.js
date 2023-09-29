const amqp = require("amqplib");
const config = require("../config");

class ProductMessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");

    try {
      const connection = await amqp.connect(config.rabbitmqUrl);
      this.channel = await connection.createChannel();
      
      await this.channel.assertQueue(config.consumeQueueName);
      console.log("RabbitMQ connected");
    } catch (err) {
      console.error("Failed to connect to RabbitMQ:", err.message);
    }
  }

  async isConnected() {
    return this.channel != null;
  }

  async publishMessage(message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      this.channel.sendToQueue(
        config.publishQueueName,
        Buffer.from(JSON.stringify(message))
      );
    } catch (err) {
      console.log(err);
    }
  }

  async consumeMessage(callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(config.consumeQueueName, (message) => {
        const content = JSON.parse(message.content.toString());

        callback(content);
        
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
      this.channel.reject(message, false);
    }
  }
}

module.exports = new ProductMessageBroker();
