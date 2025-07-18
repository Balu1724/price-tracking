import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "react-router-dom";
import Notification from "../component/Notification"; // Importing Notification component
import "./Review.css";

const Review = () => {
	const { productId } = useParams();
	const [reviews, setReviews] = useState([]);
	const [text, setText] = useState("");
	const [rating, setRating] = useState(1);
	const [error, setError] = useState("");
	const [notification, setNotification] = useState(""); // Notification state
	const [isWritingReview, setIsWritingReview] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false); // User login state

	// Fetch reviews when the component mounts
	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3001/route/products/${productId}/reviews`
				);
				setReviews(response.data);
			} catch (err) {
				console.error(err);
				setError("Error fetching reviews");
			}
		};

		fetchReviews();
	}, [productId]);

	// Check if the user is logged in when the component mounts
	useEffect(() => {
		const userId = localStorage.getItem("userID"); // Check for token
		if (userId) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, []);

	// Clear notifications after 3 seconds
	useEffect(() => {
		if (notification) {
			const timeout = setTimeout(() => {
				setNotification("");
			}, 3000);

			return () => clearTimeout(timeout);
		}
	}, [notification]);

	// Handle form submission for new review
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!text) return;

		if (!isLoggedIn) {
			setNotification("You need to be logged in to post a review.");
			return;
		}

		try {
			const userId = localStorage.getItem("userID"); // Replace with actual userId from your context or state
			const response = await axios.post(
				`http://localhost:3001/route/products/${productId}/reviews`,
				{
					userId,
					text,
					rating,
				}
			);

			// Update reviews state with the new review and re-render
			setReviews([...reviews, response.data]);
			setText("");
			setRating(1);
			setIsWritingReview(false); // Hide the form after submission
		} catch (err) {
			console.error(err);
			setError("Error posting review");
		}
	};

	// Handle cancel button click
	const handleCancel = () => {
		setIsWritingReview(false); // Hide the review form
		setText(""); // Clear the text area
		setRating(1); // Reset rating to default
	};

	return (
		<div className="review-section">
			<h2>Reviews</h2>
			{error && <p className="error">{error}</p>}

			{/* Notification display */}
			{notification && (
				<Notification
					message={notification}
					onClose={() => setNotification("")}
				/>
			)}

			{isWritingReview ? (
				<form onSubmit={handleSubmit} className="review-form">
					<textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Write your review here..."
						required
					/>
					<div>
						<label>Rating:</label>
						<select
							value={rating}
							onChange={(e) => setRating(e.target.value)}
							required
						>
							{[1, 2, 3, 4, 5].map((rate) => (
								<option key={rate} value={rate}>
									{rate}
								</option>
							))}
						</select>
					</div>
					<div className="form-buttons">
						<button type="submit">Post</button>
						<button type="button" onClick={handleCancel}>
							Cancel
						</button>
					</div>
				</form>
			) : (
				<button
					onClick={() =>
						isLoggedIn
							? setIsWritingReview(true)
							: setNotification(
									"You need to be logged in to write a review."
							  )
					}
				>
					Write a Review
				</button>
			)}

			<div className="reviews-list">
				{reviews.map((review) => (
					<div key={review._id} className="review-item">
						<p>
							<strong>
								{review.userId.username || "Unknown User"}
							</strong>
						</p>
						<p>{review.text}</p>
						<p>
							Rating: {"★".repeat(review.rating)} {review.rating}{" "}
							/ 5
						</p>
						<p>
							Created:{" "}
							{formatDistanceToNow(new Date(review.createdAt), {
								addSuffix: true,
							})}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Review;
