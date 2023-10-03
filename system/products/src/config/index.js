require("dotenv").config();

module.exports = {
  port: process.env.PORT,
  mongodbUrl: process.env.MONGODB_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  publishQueueName: process.env.PUBLISH_QUEUE_NAME,
  consumeQueueName: process.env.CONSUME_QUEUE_NAME,
  jwtSecret: process.env.JWT_SECRET,
};
