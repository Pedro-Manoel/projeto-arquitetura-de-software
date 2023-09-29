const ProductsRepository = require('../repositories/ProductRepository');

class ProductService {
  constructor() {
    this.productsRepository = new ProductsRepository();
  }

  async createProduct(product) {
    const createdProduct = await this.productsRepository.create(product);

    return createdProduct;
  }

  async getProductById(productId) {
    const product = await this.productsRepository.findById(productId);

    return product;
  }

  async getProducts(ids) {
    const products = await this.productsRepository.findAll(ids);

    return products;
  }

  async dbIsConnected () {
   return this.productsRepository.dbIsConnected();
  }
}

module.exports = ProductService;
