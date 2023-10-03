const UserService = require("../services/UserService");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async login(req, res) {
    const { username, password } = req.body;

    const result = await this.userService.login(username, password);

    if (result.success) {
      res.json({ token: result.token });
    } else {
      res.status(400).json({ message: result.message });
    }
  }

  async register(req, res) {
    const user = req.body;
  
    try {
      const existingUser = await this.userService.findUserByUsername(user.username);
  
      if (existingUser) {
        throw new Error("Username already taken");
      }
  
      const result = await this.userService.register(user);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getProfile(req, res) {
    const username = req.user.username;

    try {
      const user = await this.userService.getUserByUsername(username);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async healthCheck(_, res) {
    try {
      const mongodbUp = await this.userService.dbIsConnected()

      const healthcheck = {
        status: mongodbUp ? "UP" : "DOWN",
        timestamp: Date.now(),
        checks: [
          {
            name: "MongoDB",
            status: mongodbUp ? "UP" : "DOWN",
          },
        ]
      };

      res.status(mongodbUp ? 200 : 400).json(healthcheck);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

}

module.exports = UserController;
