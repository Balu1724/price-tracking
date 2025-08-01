const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	text: { type: String, required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", ReviewSchema);
