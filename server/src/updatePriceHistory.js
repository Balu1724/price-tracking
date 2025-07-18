// const mongoose = require('mongoose');
// const Product = require('./models/Product.js');
// const scrapeAmazonPrice = require('./scrapeAmazon.js');
// const scrapeFlipkartPrice = require('./scrapeFlipkart.js');

// // Connection string for MongoDB
// const connectionString = 'mongodb+srv://sarveshpadmanaban013:LhzYmuSddyCdGzIw@kmsproject.30wwd.mongodb.net/';

// // Function to update price history
// const updatePriceHistory = async () => {
//   console.log("Starting the price history update process...");
//   try {
//     // Fetch the first product
//     const product = await Product.findOne({}, 'name price priceHistory amazonUrl flipkartUrl').limit(1);
//     if (!product) {
//       console.log("No products found in the database.");
//       return;
//     }
//     console.log(`Fetched product: ${product.name}`);

//     let lowestPrice = null;
//     let priceSource = '';

//     // Fetch prices from Amazon and Flipkart
//     const amazonPriceData = product.amazonUrl ? await scrapeAmazonPrice(product.amazonUrl) : null;
//     console.log(`Amazon price data: ${JSON.stringify(amazonPriceData)}`);

//     const flipkartPriceData = product.flipkartUrl ? await scrapeFlipkartPrice(product.flipkartUrl) : null;
//     console.log(`Flipkart price data: ${JSON.stringify(flipkartPriceData)}`);

//     // Determine the lowest price
//     if (amazonPriceData && flipkartPriceData) {
//       lowestPrice = Math.min(amazonPriceData.price, flipkartPriceData.price);
//       priceSource = lowestPrice === amazonPriceData.price ? 'Amazon' : 'Flipkart';
//     } else if (amazonPriceData) {
//       lowestPrice = amazonPriceData.price;
//       priceSource = 'Amazon';
//     } else if (flipkartPriceData) {
//       lowestPrice = flipkartPriceData.price;
//       priceSource = 'Flipkart';
//     }

//     // If a price was found, update the product price and history
//     if (lowestPrice !== null) {
//       console.log(`Lowest price determined: ${lowestPrice} from ${priceSource}`);
//       product.price = lowestPrice;
//       product.priceHistory.push({ price: lowestPrice, source: priceSource });
//       await product.save();
//       console.log(`Updated price for product: ${product.name} with source: ${priceSource}`);
//     } else {
//       console.log(`No price found for product: ${product.name}`);
//     }
//   } catch (error) {
//     console.error("Error updating price history:", error);
//   }
//   console.log("Price history update process completed.");
// };

// // Connect to MongoDB and then update the price history
// mongoose
//   .connect(connectionString)
//   .then(() => {
//     console.log("MongoDB connected successfully");
//     updatePriceHistory(); // Start the price update process after the DB connection is successful
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//   });

const Product = require("./models/Product.js");
const scrapeAmazonPrice = require("./scrapeAmazon.js");
const scrapeFlipkartPrice = require("./scrapeFlipkart.js");
const mongoose = require("mongoose");

const connectionString =
	"my-mongo-db-connection-string";

mongoose
	.connect(connectionString)
	.then(() => {
		console.log("MongoDB connected successfully");
		updatePriceHistory(); // Start the price update process after the DB connection is successful
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error);
	});

const updatePriceHistory = async () => {
	console.log("Starting the price history update process...");

	// Fetch products with necessary fields (id, name, price, priceHistory, amazonUrl, flipkartUrl)
	const products = await Product.find(
		{},
		"id name price priceHistory amazonUrl flipkartUrl"
	);
	console.log(`Fetched ${products.length} products from the database.`);

	for (const product of products) {
		console.log(`Updating price history for product: ${product.name}`);
		let lowestPrice = null;
		let priceSource = "";

		// Fetch prices from Amazon and Flipkart
		const amazonPriceData = product.amazonUrl
			? await scrapeAmazonPrice(product.amazonUrl)
			: null;
		console.log(`Amazon price data: ${JSON.stringify(amazonPriceData)}`);

		const flipkartPriceData = product.flipkartUrl
			? await scrapeFlipkartPrice(product.flipkartUrl)
			: null;
		console.log(
			`Flipkart price data: ${JSON.stringify(flipkartPriceData)}`
		);

		// Determine the lowest price from Amazon and Flipkart
		if (amazonPriceData && flipkartPriceData) {
			lowestPrice = Math.min(
				amazonPriceData.price,
				flipkartPriceData.price
			);
			priceSource =
				lowestPrice === amazonPriceData.price ? "Amazon" : "Flipkart";
		} else if (amazonPriceData) {
			lowestPrice = amazonPriceData.price;
			priceSource = "Amazon";
		} else if (flipkartPriceData) {
			lowestPrice = flipkartPriceData.price;
			priceSource = "Flipkart";
		}

		// If a price was found, update the product price and history
		if (lowestPrice !== null) {
			console.log(
				`Lowest price determined: ${lowestPrice} from ${priceSource}`
			);

			// Update product price and add to priceHistory
			product.price = lowestPrice;
			product.priceHistory.push({
				price: lowestPrice,
				date: new Date(),
				source: priceSource,
			});

			// Save the updated product
			await product.save();
			console.log(
				`Updated price for product: ${product.name} with source: ${priceSource}`
			);
		} else {
			console.log(`No price found for product: ${product.name}`);
		}
	}

	console.log("Price history update process completed.");
};

// // Call the update function
// updatePriceHistory();
