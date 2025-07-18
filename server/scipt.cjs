// Use require syntax in CommonJS
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product.js');
// Ensure your Product model is defined here

// Load environment variables
dotenv.config();

// MongoDB URI and PORT from environment variables
const MONGO_URI =
	process.env.MONGO_URI ||
	"mongodb+srv://sarveshpadmanaban013:LhzYmuSddyCdGzIw@kmsproject.30wwd.mongodb.net/";
const PORT = process.env.PORT || 3001;

// Define products to update
const products = [
	{
		_id: "67043a8416e2b2ff0b6f49cd",
		amazonUrl:
			"https://www.amazon.in/2022-Apple-MacBook-Laptop-chip/dp/B0B3BMKMGP",
		flipkartUrl:
			"https://www.flipkart.com/apple-2023-macbook-pro-m2-16-gb-512-gb-ssd-macos-ventura-mphh3hn-a/p/itmd887af4ee5f98",
		basePrice: 184000,
	},
	{
		_id: "67043a9216e2b2ff0b6f49d0",
		amazonUrl:
			"https://www.amazon.in/HP-Spectre-14-inch-shutter-eu0666TU/dp/B0CRKQ9BKZ",
		flipkartUrl:
			"https://www.flipkart.com/hp-spectre-x360-ai-pc-intel-core-ultra-7-155h-32-gb-1-tb-ssd-windows-11-home-14-eu0666tu-2-1-laptop/p/itm4ed45e6f68b68",
		basePrice: 164999,
	},
	{
		_id: "67043abf16e2b2ff0b6f49d3",
		amazonUrl:
			"https://www.amazon.in/Sony-Bravia-inches-Google-KD-65X74K/dp/B09WN3SRC7",
		flipkartUrl:
			"https://www.flipkart.com/sony-bravia-x75l-163-9-cm-65-inch-ultra-hd-4k-led-smart-google-tv/p/itmb229240727d23",
		basePrice: 80000,
	},
	{
		_id: "67043acd16e2b2ff0b6f49d6",
		amazonUrl:
			"https://www.amazon.in/LG-Frost-Free-Inverter-Refrigerator-GL-B257HDSY/dp/B0BX4FBVQB",
		flipkartUrl:
			"https://www.flipkart.com/lg-655-l-frost-free-side-refrigerator-smart-inverter-compressor-express-freeze-multi-air-flow/p/itm18b5f2abdf6fc",
		basePrice: 89999,
	},
	{
		_id: "67043ad516e2b2ff0b6f49d9",
		amazonUrl: "https://www.amazon.in/Canon-EOS-R6-Mark-II/dp/B0BQYFNTZX",
		flipkartUrl:
			"https://www.flipkart.com/canon-eos-r6-mark-ii-mirrorless-camera-body-only/p/itm4dc1eb0bf858b",
		basePrice: 188000,
	},
	{
		_id: "6700d872dd86fcff36d6e9cf",
		amazonUrl: "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX2F5QT",
		flipkartUrl:
			"https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d",
		basePrice: 65000,
	},
	{
		_id: "6700d87edd86fcff36d6e9d2",
		amazonUrl: "https://www.amazon.in/Apple-iPhone-16-128-GB/dp/B0DGHZWBYB",
		flipkartUrl:
			"https://www.flipkart.com/apple-iphone-16-white-128-gb/p/itm7c0281cd247be",
		basePrice: 75000,
	},
	{
		_id: "67043a5916e2b2ff0b6f49c1",
		amazonUrl:
			"https://www.amazon.in/Samsung-Galaxy-Ultra-Green-Storage/dp/B0BT9CXXXX",
		flipkartUrl:
			"https://www.flipkart.com/samsung-galaxy-s23-ultra-5g-phantom-black-256-gb/p/itm15952643ba06d",
		basePrice: 80000,
	},
	{
		_id: "67043a6716e2b2ff0b6f49c4",
		amazonUrl:
			"https://www.amazon.in/Pxel-Obsidian-128GB-Storage-Smartphone/dp/B0DL6G1HDC",
		flipkartUrl:
			"https://www.flipkart.com/google-pixel-7-pro-obsidian-128-gb/p/itmb74dc5c3b3eb5",
		basePrice: 48000,
	},
	{
		_id: "67043a6f16e2b2ff0b6f49c7",
		amazonUrl:
			"https://www.amazon.in/OnePlus-Flowy-Emerald-512GB-Storage/dp/B0CQPP6JTH",
		flipkartUrl:
			"https://www.flipkart.com/oneplus-12-flowy-emerald-512-gb/p/itm4464454f95a2e",
		basePrice: 70000,
	},
	{
		_id: "67043a7b16e2b2ff0b6f49ca",
		amazonUrl:
			"https://www.amazon.in/Xiaomi-Storage-Professional-Optics-AMOLED/dp/B0CW3GQR3K",
		flipkartUrl:
			"https://www.flipkart.com/xiaomi-14-jade-green-512-gb/p/itm617acb7cd715d",
		basePrice: 50000,
	},
];

// Generate a 10-day price history with random fluctuations around a base price
const generatePriceHistory = (basePrice) => {
	const priceHistory = [];
	for (let i = 10; i > 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const fluctuation = Math.floor(Math.random() * 5000) - 2500; // Random fluctuation within ±2500
		const price = basePrice + fluctuation;
		priceHistory.push({ price, date });
	}
	return priceHistory;
};

// Update each product in the database
const updateExistingProducts = async () => {
	for (const productData of products) {
		const { _id, amazonUrl, flipkartUrl, basePrice } = productData;

		// Generate price history for each product
		const priceHistory = generatePriceHistory(basePrice);

		try {
			await Product.findByIdAndUpdate(
				_id,
				{
					amazonUrl,
					flipkartUrl,
					price: priceHistory[priceHistory.length - 1].price, // Set latest price as the current price
					priceHistory, // Add price history array
				},
				{ new: true }
			);
			console.log(`Updated product: ${productData._id}`);
		} catch (error) {
			console.error(
				`Error updating product ${productData._id}: ${error.message}`
			);
		}
	}
};

// Connect to MongoDB and execute the update function
mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log(`Connected to MongoDB at ${MONGO_URI}`);
		return updateExistingProducts();
	})
	.then(() => {
		console.log("Database update completed");
		mongoose.disconnect();
	})
	.catch((error) =>
		console.error("Error connecting to MongoDB:", error.message)
	);
