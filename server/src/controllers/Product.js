const ProductModel = require("../models/Product.js");
const UserModel = require("../models/users.js");

exports.getAllProducts = async (req, res) => {
	try {
		const products = await ProductModel.find();

		// Check if req.user exists and has a role
		const isAdmin = req.user && req.user.role === "admin";

		return res.status(200).send({ products, isAdmin });
	} catch (error) {
		return res.status(400).send({ message: error.message });
	}
};

exports.getProductByID = async (req, res) => {
	try {
		const product = await ProductModel.findById(req.params.id);
		if (!product) {
			return res.status(404).send({ message: "Product not found" });
		}
		return res.status(200).send(product);
	} catch (error) {
		return res.status(400).send({ message: error.message });
	}
};

exports.postProduct = async (req, res) => {
	// Destructure the necessary fields from the request body
	const { name, category, price, amazonUrl, flipkartUrl } = req.body;

	// Only allow admins to add products
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "Unauthorized" });
	}

	// Create a new product with only the required fields
	const product = new ProductModel({
		name,
		category,
		price,
		amazonUrl,
		flipkartUrl,
		priceHistory: [], // Initialize with an empty array for now
	});

	try {
		const newProduct = await product.save();
		res.status(201).json(newProduct);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};
// exports.postRecipe = async (req, res) => {
// 	try {
// 		const recipeTitle = await RecipeModel.findOne({
// 			title: req.body.title,
// 		});
// 		if (recipeTitle) {
// 			return res.status(400).json({
// 				message: "Recipe Already exists, Give different recipe title",
// 			});
// 		}
// 		const newRecipe = new RecipeModel(req.body);
// 		await newRecipe.save();

// 		const user = await UserModel.findById(req.body.userOwner);
// 		user.myRecipes.push(newRecipe._id);
// 		await user.save();

// 		res.status(201).json(newRecipe);
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// };

// exports.uploadImage = async (req, res) => {
// 	try {
// 		res.status(201).json({ imagePath: `/images/${req.file.filename}` });
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// }

// exports.updateSaveRecipe = async (req, res) => {
// 	try {
// 		const recipe = await RecipeModel.findById(req.body.recipeID);
// 		const user = await UserModel.findById(req.body.userID);
// 		user.savedRecipes.push(recipe);
// 		await user.save();
// 		res.json({ savedRecipes: user.savedRecipes });
// 	} catch (err) {
// 		res.json(err);
// 	}
// };

// exports.editRecipe = async (req, res) => {
// 	try {
// 		const recipe = await RecipeModel.findByIdAndUpdate(
// 			req.params.recipeID,
// 			req.body,
// 			{
// 				new: true,
// 			}
// 		);
// 		res.status(201).json(recipe);
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// }

// exports.getSaveRecipeByID = async (req, res) => {
// 	try {
// 		const user = await UserModel.findById(req.params.userID).populate(
// 			"savedRecipes"
// 		);
// 		if (!user) {
// 			return res.status(404).json({ message: "User not found" });
// 		}
// 		return res.status(200).json(user.savedRecipes);
// 	} catch (error) {
// 		res.status(500).json({
// 			message: "Error fetching saved recipes",
// 			error: error.message,
// 		});
// 	}
// };

// exports.deleteSaveRecipe = async (req, res) => {
// 	const { userID, recipeID } = req.body;

// 	try {
// 		const user = await UserModel.findByIdAndUpdate(
// 			userID,
// 			{ $pull: { savedRecipes: recipeID } },
// 			{ new: true }
// 		);

// 		if (!user) {
// 			return res.status(404).json({ message: "User not found" });
// 		}

// 		res.json({
// 			message: "Recipe removed from saved recipes",
// 			savedRecipes: user.savedRecipes,
// 		});
// 	} catch (err) {
// 		res.status(500).json({ message: "Server error", error: err.message });
// 	}
// };

// exports.getMyRecipesByID = async (req, res) => {
// 	try {
// 		const user = await UserModel.findById(req.params.userID).populate(
// 			"myRecipes"
// 		);
// 		if (!user) {
// 			return res.status(404).json({ message: "User not found" });
// 		}
// 		return res.status(200).json(user.myRecipes);
// 	} catch (error) {
// 		res.status(500).json({
// 			message: "Error fetching my recipes",
// 			error: error.message,
// 		});
// 	}
// };

exports.deleteProduct = async (req, res) => {
	try {
		const product = await ProductModel.findByIdAndDelete(req.params.id);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		res.json({ message: "Product deleted" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.getProductDetails = async (req, res) => {
	try {
		const productId = req.params.id; // Get the product ID from the request params

		// Fetch the product from the database by its ID
		const product = await ProductModel.findById(productId);

		// If no product is found, return a 404 error
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Return the product's base price, price history, and URLs
		const productDetails = {
			name: product.name,
			price: product.price,
			priceHistory: product.priceHistory,
			amazonUrl: product.amazonUrl,
			flipkartUrl: product.flipkartUrl,
		};

		return res.status(200).json(productDetails); // Return the product details in the response
	} catch (error) {
		console.error("Error fetching product details:", error);
		return res.status(500).json({ message: "Server error" }); // Return a server error if something goes wrong
	}
};
