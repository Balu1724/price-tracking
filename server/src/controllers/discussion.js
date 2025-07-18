const DiscussionModel = require("../models/Discussion");
const ProductModel = require("../models/Product");
const mongoose = require("mongoose");

// Get all discussions for a specific product (only title and user)
exports.getDiscussions = async (req, res) => {
	try {
		const product = await ProductModel.findById(
			req.params.productID
		).populate({
			path: "discussions",
			select: "title content userId createdAt", // Select title, content, and userId
			populate: {
				path: "userId", // Populate user details
				select: "_id username", // Fetch both userId and username
			},
		});

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		if (!product.discussions || product.discussions.length === 0) {
			return res
				.status(404)
				.json({ message: "No discussions found for this product" });
		}

		// Map discussions to return title, content, username, and userId._id
		const discussions = product.discussions.map((discussion) => ({
			_id: discussion._id,
			title: discussion.title,
			content: discussion.content,
			username: discussion.userId.username,
			createdAt: discussion.createdAt,
			// Return userId._id
		}));

		res.status(200).json(discussions);
	} catch (err) {
		console.error(err); // Log the error for debugging
		res.status(400).json({ message: "Error retrieving discussions" });
	}
};

exports.getDiscussionById = async (req, res) => {
	try {
		const discussionId = req.params.discussionId;

		// Find the discussion and populate userId in comments and replies
		const discussion = await DiscussionModel.findById(discussionId)
			.populate({
				path: "userId",
				select: "username",
			})
			.populate({
				path: "comments.userId", // Populate the userId in comments
				select: "username",
			})
			.populate({
				path: "comments.replies.userId", // Populate the userId in replies
				select: "username",
			});

		if (!discussion) {
			return res.status(404).json({ message: "Discussion not found" });
		}

		// Nest the comments before sending the response
		const nestedComments = nestComments(discussion.comments);

		res.status(200).json({
			...discussion.toObject(),
			comments: nestedComments,
		});
	} catch (err) {
		console.error("Error fetching discussion:", err);
		res.status(500).json({
			message: "An error occurred while fetching the discussion",
			error: err.message,
		});
	}
};

// Utility function to nest comments
const nestComments = (comments) => {
	const commentMap = {};
	const roots = [];

	// Create a map of comments
	comments.forEach((comment) => {
		commentMap[comment._id] = { ...comment.toObject(), replies: [] }; // Add empty replies array and convert to plain object
	});

	// Build the nested structure
	comments.forEach((comment) => {
		if (comment.parentId) {
			commentMap[comment.parentId].replies.push(commentMap[comment._id]);
		} else {
			roots.push(commentMap[comment._id]); // Push top-level comments
		}
	});

	return roots;
};

// Post a new discussion for a product
exports.postDiscussion = async (req, res) => {
	try {
		const product = await ProductModel.findById(req.params.productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const discussion = new DiscussionModel({
			userId: req.body.userId,
			title: req.body.title,
			content: req.body.content,
			productId: req.params.productId,
			comments: [], // Initialize empty comments
		});

		const savedDiscussion = await discussion.save();

		// Update the product with the new discussion
		product.discussions.push(savedDiscussion._id);
		await product.save();

		res.status(201).json(savedDiscussion);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Post a new comment to a discussion
exports.postComment = async (req, res) => {
	try {
		const discussion = await DiscussionModel.findById(
			req.params.discussionId
		);
		if (!discussion) {
			return res.status(404).json({ message: "Discussion not found" });
		}

		// Validate that the text is provided
		if (!req.body.text) {
			return res
				.status(400)
				.json({ message: "Comment text is required" });
		}

		const comment = {
			userId: req.body.userId,
			text: req.body.text,
			createdAt: new Date(),
			replies: [], // Initialize empty replies
		};

		discussion.comments.push(comment); // Add comment to the discussion
		await discussion.save();

		res.status(201).json(discussion);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

// Helper function to find comments based on ID
const findCommentById = (comments, commentId) => {
	if (!Array.isArray(comments)) return null;

	return comments.find((comment) => comment._id.toString() === commentId);
};

// Post a reply to a specific comment in a discussion
exports.postReply = async (req, res) => {
	try {
		const discussion = await DiscussionModel.findById(
			req.params.discussionId
		);
		if (!discussion) {
			return res.status(404).json({ message: "Discussion not found" });
		}

		const targetComment = findCommentById(
			discussion.comments,
			req.params.commentId
		);
		if (!targetComment) {
			return res.status(404).json({ message: "Comment not found" });
		}

		if (!req.body.userId || !req.body.text) {
			return res
				.status(400)
				.json({ message: "User ID and reply text are required" });
		}

		// Create the reply object
		const reply = {
			_id: new mongoose.Types.ObjectId(),
			userId: req.body.userId,
			text: req.body.text,
			createdAt: new Date(),
			parentId: targetComment._id, // Set the parentId to the target comment ID
		};

		// Push reply into the comments array of the discussion
		discussion.comments.push(reply); // Add to the comments list
		await discussion.save();

		const populatedDiscussion = await DiscussionModel.findById(
			req.params.discussionId
		).populate("comments.userId");
		return res.status(200).json(populatedDiscussion);
	} catch (err) {
		console.error(err);
		return res.status(400).json({ message: err.message });
	}
};

// Delete a discussion
exports.deleteDiscussion = async (req, res) => {
	try {
		const discussion = await DiscussionModel.findByIdAndDelete(
			req.params.id
		);
		if (!discussion) {
			return res.status(404).json({ message: "Discussion not found" });
		}

		// Remove the discussion ID from the product's discussions array
		const product = await ProductModel.findById(discussion.productId);
		product.discussions = product.discussions.filter(
			(d) => d.toString() !== req.params.id
		);
		await product.save();

		res.json({ message: "Discussion deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
