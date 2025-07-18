const mongoose = require("mongoose");

// Define the Reply Schema
const ReplySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	text: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment", // Reference to the parent comment
		required: true, // Required for replies to identify their parent
	},
});

// Define the Comment Schema
const CommentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	text: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment", // Reference to the parent comment
		default: null, // Null if it’s a top-level comment
	},
	replies: [ReplySchema], // Nested replies
});

// Define the Discussion Schema
const DiscussionSchema = new mongoose.Schema({
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
	title: { type: String, required: true },
	content: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	comments: [CommentSchema], // Flat structure for comments
});

// Export the Discussion Model
module.exports = mongoose.model("Discussion", DiscussionSchema);
