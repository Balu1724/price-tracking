const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
require("dotenv").config();
const { userRouter: authRouter } = require("./routes/users");
const Router = require("./routes/routes.js");

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT;
const connectionString = process.env.MONGO_URI;

mongoose
	.connect(connectionString)
	.then(() => {
		console.log("MongoDB connected successfully");
		// Start the server only after the database connection is established
		app.listen(port, () => console.log(`Server started on port ${port}`));
	})
	.catch((error) => {
		console.error("MongoDB connection failed:", error.message);
		process.exit(1);
	});

// Use routes
app.use("/auth", authRouter);
app.use("/route", Router);
