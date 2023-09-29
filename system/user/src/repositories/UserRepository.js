const { default: mongoose } = require("mongoose");
const User = require("../models/User");

class UserRepository {
  async createUser(user) {
    return await User.create(user);
  }

  async getUserByUsername(username) {
    return await User.findOne({ username });
  }

  async dbIsConnected() {
    return mongoose.connection.readyState === 1;
  }

}

module.exports = UserRepository;
