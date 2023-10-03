const { default: mongoose } = require("mongoose");
const Product = require("../models/Product");

class ProductRepository {
  async create(product) {
    const createdProduct = await Product.create(product);

    return createdProduct.toObject();
  }

  async findById(productId) {
    const product = await Product.findById(productId).lean();

    return product;
  }

  async findAll(ids) {
    const products = ids ? await Product.find({ _id: { $in: ids } }).lean() : await Product.find().lean();

    return products;
  }

  async dbIsConnected() {
     return mongoose.connection.readyState === 1;
  }
}

module.exports = ProductRepository;
