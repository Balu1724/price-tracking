//

// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	name: { type: String, required: true },
	category: { type: String, required: true },
	amazonUrl: { type: String }, // Amazon URL
	flipkartUrl: { type: String }, // Flipkart URL
	price: { type: Number, required: true },
	priceHistory: [
		{
			price: { type: Number },
			date: { type: Date, default: Date.now },
			source: { type: String }, // Source: Amazon or Flipkart
		},
	],
	reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
	discussions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discussion" }],
	questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
