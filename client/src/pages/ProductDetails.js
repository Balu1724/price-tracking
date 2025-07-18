import React, { useState } from "react";
import PriceTracking from "./PriceTracking";
import Discussion from "./Discussion";
import Reviews from "./Reviews";
import QandA from "./QandA";

import "./ProductDetails.css";

const ProductDetails = () => {
	const [activeTab, setActiveTab] = useState("price-tracking"); // Default to Price Tracking
	const [tabKeys, setTabKeys] = useState({
		priceTracking: 0,
		discussion: 0,
		reviews: 0,
		qanda: 0,
	});

	// Function to handle tab switch
	const handleTabSwitch = (tab) => {
		setActiveTab(tab);
		// Increment the respective key to force re-mount
		setTabKeys((prevKeys) => ({
			...prevKeys,
			[tab]: prevKeys[tab] + 1,
		}));
	};

	return (
		<div className="product-details">
			<h1>Product Details</h1>

			{/* Tabs for navigation */}
			<div className="tabs">
				<button onClick={() => handleTabSwitch("price-tracking")}>
					Price Tracking
				</button>
				<button onClick={() => handleTabSwitch("discussion")}>
					Discussion
				</button>
				<button onClick={() => handleTabSwitch("reviews")}>
					Reviews
				</button>
				<button onClick={() => handleTabSwitch("qanda")}>Q&A</button>
			</div>

			{/* Conditionally render content based on the active tab */}
			<div className="tab-content">
				{activeTab === "price-tracking" && (
					<PriceTracking key={tabKeys.priceTracking} />
				)}
				{activeTab === "discussion" && (
					<Discussion key={tabKeys.discussion} />
				)}
				{activeTab === "reviews" && <Reviews key={tabKeys.reviews} />}
				{activeTab === "qanda" && <QandA key={tabKeys.qanda} />}
			</div>
		</div>
	);
};

export default ProductDetails;
