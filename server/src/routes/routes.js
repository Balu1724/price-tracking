const express = require("express");
const router = express.Router();

// const multer = require("multer");
// const path = require("path");

const productController = require("../controllers/Product");
const discussionController = require("../controllers/discussion");
const reviewController = require("../controllers/review");
const questionController = require("../controllers/question");
const authenticate = require("../controllers/authenticate");
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(
// 			null,
// 			path.join(__dirname, "../../../client/recipe-app/public/images")
// 		);
// 	},
// 	filename: (req, file, cb) => {
// 		cb(
// 			null,
// 			file.fieldname + "_" + Date.now() + path.extname(file.originalname)
// 		);
// 	},
// });

// const upload = multer({
// 	storage: storage,
// });

// --------- Product Routes ---------
// Get all products
router.get("/products", authenticate , productController.getAllProducts);

// Get a single product by ID
router.get("/products/:id", productController.getProductByID);

router.get("/products/:id/price", productController.getProductDetails);

// Post a new product
router.post("/products", authenticate, productController.postProduct);

// Delete a product by ID
router.delete("/products/:id", productController.deleteProduct);

// --------- Discussion Routes ---------
// Get all discussions for a specific product (only title and userId)
router.get(
	"/products/:productID/discussions",
	discussionController.getDiscussions
);

router.get(
	"/discussions/:discussionId",
	discussionController.getDiscussionById
);

// Post a new discussion for a specific product
router.post(
	"/products/:productId/discussions",
	discussionController.postDiscussion
);

// Post a top-level comment to a specific discussion
router.post(
	"/discussions/:discussionId/comments",
	discussionController.postComment
);

// Post a reply to a specific comment
router.post(
	"/discussions/:discussionId/comments/:commentId/reply",
	discussionController.postReply
);

// Delete a discussion
router.delete("/discussions/:id", discussionController.deleteDiscussion);

// --------- Review Routes ---------
// Get all reviews for a specific product
router.get("/products/:productId/reviews", reviewController.getReviews);

// Post a new review for a product
router.post("/products/:productId/reviews", reviewController.postReviews);

// Delete a review
router.delete("/reviews/:id", reviewController.deleteReview);

// --------- Question Routes ---------
router.post(
	"/products/:productId/questions",
	authenticate,
	questionController.submitQuestion
);

router.get(
	"/products/:productId/questions",
	questionController.getQuestionsWithAnswers
);

router.get(
	"/products/:productId/unanswered-questions",
	authenticate,
	questionController.fetchUnansweredQuestions
);

router.post(
	"/products/:productId/answer",
	authenticate,
	questionController.answerQuestion
);

module.exports = router;
