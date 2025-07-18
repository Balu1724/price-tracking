const reviewModel = require("../models/Review");
const productModel = require("../models/Product");

exports.getReviews = async (req, res) => {
	try {
		const product = await productModel
			.findById(req.params.productId)
			.populate({
				path: "reviews",
				populate: {
					path: "userId", // Populate userId field from the Review schema
					select: "username", // Only select the username from the User model
				},
			});

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		res.json(product.reviews);
	} catch (err) {
		res.status(404).json({ message: "Product or reviews not found" });
	}
};

exports.postReviews = async (req, res) => {
	try {
		const product = await productModel.findById(req.params.productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const review = new reviewModel({
			userId: req.body.userId,
			text: req.body.text,
			rating: req.body.rating,
			productId: req.params.productId,
		});

		const savedReview = await review.save();

		// Update the product with the new review
		product.reviews.push(savedReview._id);
		await product.save();

		res.status(201).json(savedReview);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

exports.deleteReview = async (req, res) => {
	try {
		const review = await reviewModel.findById(req.params.id);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}
		const product = await productModel.findById(review.productId);
		product.reviews = product.reviews.filter(
			(r) => r.toString() !== req.params.id
		);

		await product.save();

		await reviewModel.deleteOne({ _id: req.params.id });
		res.json({ message: "Review deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
