const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/User");
const UserRepository = require("../repositories/UserRepository");

class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async findUserByUsername(username) {
    const user = await User.findOne({ username });

    return user;
  }

  async getUserByUsername(id) {
    const user = await this.userRepository.getUserByUsername(id);

    return user;
  }

  async login(username, password) {
    const user = await this.userRepository.getUserByUsername(username);

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid username or password" };
    }

    const token = jwt.sign({ username: user.username }, config.jwtSecret);

    return { success: true, token };
  }

  async register(user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return await this.userRepository.createUser(user);
  }

  async dbIsConnected() {
    return this.userRepository.dbIsConnected();
  }

}

module.exports = UserService;
