const express = require("express");
const authRouter = express.Router();
const userController = require("../controllers/user.js");

authRouter.post("/register", userController.registerUser);

authRouter.post("/login", userController.loginUser);

module.exports.userRouter = authRouter;
