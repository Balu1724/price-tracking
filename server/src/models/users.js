const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ["user", "admin"], // Role can be either 'user' or 'admin'
		default: "user",
	},
	savedProducts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		},
	],
	// myRecipes: [
	// 	{
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "recipes",
	// 	},
	// ],
});

module.exports = mongoose.model("users", userSchema);
