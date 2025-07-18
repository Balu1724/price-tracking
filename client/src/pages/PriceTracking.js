// PriceTracking.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./PriceTracking.css";

const PriceTracking = () => {
	const { productId } = useParams(); // Extract productId from the URL
	const [productData, setProductData] = useState(null);

	useEffect(() => {
		// Fetch product data
		const fetchData = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3001/route/products/${productId}/price`
				);
				setProductData(response.data);
			} catch (error) {
				console.error("Error fetching product data:", error);
			}
		};
		fetchData();
	}, [productId]);

	if (!productData) {
		return <p>Loading...</p>;
	}

	// Prepare data for chart
	const chartData = {
		labels: productData.priceHistory.map((entry) =>
			new Date(entry.date).toLocaleDateString("en-IN", {
				day: "numeric",
				month: "short",
				year: "numeric",
			})
		),
		datasets: [
			{
				label: "Price (INR)",
				data: productData.priceHistory.map((entry) => entry.price),
				fill: false,
				borderColor: "#007bff",
				backgroundColor: "#007bff",
				pointBackgroundColor: "#007bff",
				tension: 0.1,
			},
		],
	};

	// Latest price information
	const latestPriceEntry =
		productData.priceHistory[productData.priceHistory.length - 1];

	return (
		<div className="price-tracking">
			<h2>{productData.name} Price Tracking</h2>
			<div className="price-links">
				<a
					href={productData.amazonUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					Buy on Amazon
				</a>
				<a
					href={productData.flipkartUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					Buy on Flipkart
				</a>
			</div>
			<div className="chart-container">
				<Line
					data={chartData}
					options={{ responsive: true, maintainAspectRatio: false }}
				/>
			</div>
			<div className="latest-price">
				<h3>Latest Price</h3>
				<p>Price: ₹{latestPriceEntry.price}</p>
				<p>Source: {latestPriceEntry.source}</p>
				<p>
					Date:{" "}
					{new Date(latestPriceEntry.date).toLocaleDateString(
						"en-IN",
						{
							day: "numeric",
							month: "short",
							year: "numeric",
						}
					)}
				</p>
			</div>
		</div>
	);
};

export default PriceTracking;
