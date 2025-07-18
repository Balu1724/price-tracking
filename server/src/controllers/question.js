// const QuestionModel = require("../models/Question");

// // User can submit a question
// exports.submitQuestion = async (req, res) => {
// 	const { content, userId } = req.body; // Use productId instead of product
// 	const productId = req.params.productId;

// 	try {
// 		// Check for existing similar questions for this specific product
// 		const existingQuestion = await QuestionModel.findOne({
// 			product: productId, // Check against productId
// 			content: { $regex: new RegExp(content, 'i') }, // Partial match for similar content
// 			answered: false,
// 		});

// 		if (existingQuestion) {
// 			// Increment count for the existing question
// 			existingQuestion.count += 1;
// 			await existingQuestion.save();
// 			return res.status(200).json({ message: "Question already exists. Incremented count.", question: existingQuestion });
// 		}

// 		// Create a new question if not found
// 		const newQuestion = new QuestionModel({
// 			product: productId, // Save productId reference
// 			user: userId, // Use userId from request body
// 			content,
// 		});

// 		await newQuestion.save();
// 		res.status(201).json({ message: "Question submitted successfully", question: newQuestion });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// }

const QuestionModel = require("../models/Question");
const ProductModel = require("../models/Product");

// User can submit a question
exports.submitQuestion = async (req, res) => {
	const { content, userId } = req.body; // Use productId from request params
	const productId = req.params.productId;

	try {
		// Check for existing similar questions for this specific product
		const existingQuestion = await QuestionModel.findOne({
			product: productId, // Check against productId
			content: { $regex: new RegExp(content, "i") }, // Partial match for similar content
			answered: false,
		});

		if (existingQuestion) {
			// Increment count for the existing question
			existingQuestion.count += 1;
			await existingQuestion.save();
			return res
				.status(200)
				.json({
					message: "Question already exists. Incremented count.",
					question: existingQuestion,
				});
		}

		// Create a new question if not found
		const newQuestion = new QuestionModel({
			product: productId, // Save productId reference
			user: userId, // Use userId from request body
			content,
		});

		// Save the question
		await newQuestion.save();

		// Update the product's questions array with the new question ID
		await ProductModel.findByIdAndUpdate(productId, {
			$push: { questions: newQuestion._id },
		});

		res.status(201).json({
			message: "Question submitted successfully",
			question: newQuestion,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
// Admin or user fetches all questions and their answers for a specific product
exports.getQuestionsWithAnswers = async (req, res) => {
	const { productId } = req.params; // Get productId from the request parameters

	try {
		const questions = await QuestionModel.find({
			product: productId,
		})
			.populate("user", "username") // Populating user details (e.g., username)
			.populate("answers.admin", "username"); // Populating admin details in answers

		if (questions.length === 0) {
			return res
				.status(404)
				.json({ message: "No questions found for this product." });
		}

		res.status(200).json(questions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Admin fetches all unanswered questions for a specific product
exports.fetchUnansweredQuestions = async (req, res) => {
	const { productId } = req.params; // Getting productId from the route parameters
	try {
		const unansweredQuestions = await QuestionModel.find({
			product: productId,
			answered: false,
		})
			.populate("user") // Populating user details
			.populate("product"); // Populating product details (optional if needed)

		if (unansweredQuestions.length === 0) {
			return res
				.status(404)
				.json({
					message: "No unanswered questions found for this product.",
				});
		}

		res.status(200).json(unansweredQuestions);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Admin posts an answer to a question
// Admin posts an answer to a question
exports.answerQuestion = async (req, res) => {
	const { questionId, content } = req.body;
	const adminId = req.user.id; // Get admin ID from decoded token

	try {
		// Check if the user has admin privileges
		if (req.user.role !== "admin") {
			return res
				.status(403)
				.json({
					message: "Access denied. Only admins can answer questions.",
				});
		}

		const question = await QuestionModel.findById(questionId);

		if (!question || question.answered) {
			return res
				.status(404)
				.json({ message: "Question not found or already answered." });
		}

		// Add the admin's answer to the answers array
		question.answers.push({
			admin: adminId, // Use adminId from the token
			content,
		});
		question.answered = true; // Mark as answered
		await question.save();

		res.status(200).json({
			message: "Answer submitted successfully",
			question,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
