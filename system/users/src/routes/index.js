const express = require("express");

const ensureAuthenticate = require("../middlewares/ensureAuthenticate");
const UserController = require("../controllers/UserController");

const router = express.Router();
const userController = new UserController();

router.post("/", (req, res) => userController.register(req, res));
router.get("/", ensureAuthenticate, (req, res) => userController.getProfile(req, res));
router.post("/login", (req, res) => userController.login(req, res));
router.get("/health", (req, res) => userController.healthCheck(req, res));

module.exports = router;
