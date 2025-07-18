const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users", // The user who posted the question
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	count: {
		type: Number,
		default: 1, // Counts how many times the question has been asked
	},
	answers: [
		{
			admin: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "users", // Admin who answered the question
				required: true,
			},
			content: {
				type: String,
				required: true,
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		},
	], // Array of answers, each provided by an admin
	answered: {
		type: Boolean,
		default: false, // Tracks if the question has been answered
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Question", QuestionSchema);
