import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns"; // For relative time formatting
import Notification from "../component/Notification"; // Your Notification component
import "./Discussions.css";

// Recursive Comment Component to handle nested comments
const Comment = ({
	comment,
	handlePostReply,
	replyText,
	setReplyText,
	cancelReply,
	setCancelReply,
	userId, // Pass userId to Comment
	setNotification,
	discussionId, // Pass setNotification to Comment
}) => {
	const [isReplying, setIsReplying] = useState(false);

	return (
		<div className="comment-item">
			<p>{comment.text}</p>
			<p>By: {comment.userId.username}</p>
			<p>
				Created:{" "}
				{formatDistanceToNow(new Date(comment.createdAt), {
					addSuffix: true,
				})}
			</p>

			{/* Reply button */}
			<button
				className="reply-button"
				onClick={() => setIsReplying(!isReplying)}
			>
				Reply
			</button>

			{/* Conditionally render reply input when reply button is clicked */}
			{isReplying && (
				<div className="reply-input">
					<input
						type="text"
						placeholder="Reply to this comment..."
						value={replyText[comment._id] || ""}
						onChange={(e) =>
							setReplyText((prev) => ({
								...prev,
								[comment._id]: e.target.value,
							}))
						}
					/>
					<button
						onClick={() => {
							if (userId) {
								handlePostReply(discussionId, comment._id);
							} else {
								setNotification(
									"You must be logged in to post a reply."
								); // Set notification for not logged in
							}
						}}
					>
						Post Reply
					</button>
					{/* Cancel button to close the reply form */}
					<button
						onClick={() => {
							setIsReplying(false);
							setCancelReply(comment._id); // Reset the reply text
						}}
					>
						Cancel
					</button>
				</div>
			)}

			{/* Nested replies */}
			<div className="replies">
				{comment.replies?.length > 0 &&
					comment.replies.map((reply) => (
						<Comment
							key={reply._id}
							comment={reply}
							handlePostReply={handlePostReply}
							replyText={replyText}
							setReplyText={setReplyText}
							cancelReply={cancelReply}
							setCancelReply={setCancelReply}
							userId={userId} // Pass userId to nested Comment
							setNotification={setNotification} // Pass setNotification to nested Comment
							discussionId={discussionId}
						/>
					))}
			</div>
		</div>
	);
};

const Discussions = () => {
	const { productId } = useParams();
	const [discussions, setDiscussions] = useState([]);
	const [selectedDiscussion, setSelectedDiscussion] = useState(null);
	const [newDiscussion, setNewDiscussion] = useState({
		title: "",
		content: "",
	});
	const [showPostDiscussionForm, setShowPostDiscussionForm] = useState(false);
	const [newComment, setNewComment] = useState({});
	const [replyText, setReplyText] = useState({});
	const [cancelReply, setCancelReply] = useState({});
	const [notification, setNotification] = useState(""); // State for notification

	// Get user ID from local storage
	const userId = localStorage.getItem("userID"); // Replace with actual key used for userId in localStorage

	useEffect(() => {
		if (notification) {
			const timeout = setTimeout(() => {
				setNotification(""); // Clear notification after 3 seconds
			}, 3000);

			return () => clearTimeout(timeout); // Cleanup on unmount
		}
	}, [notification]);

	// Fetch discussions related to the product
	useEffect(() => {
		const fetchDiscussions = async () => {
			try {
				const res = await axios.get(
					`http://localhost:3001/route/products/${productId}/discussions`
				);
				setDiscussions(res.data);
			} catch (err) {
				console.error(
					"Error fetching discussions:",
					err.response?.data || err
				);
			}
		};

		fetchDiscussions();
	}, [productId]);

	// Handle posting a new discussion
	const handlePostDiscussion = async () => {
		const { title, content } = newDiscussion;
		if (!title.trim() || !content.trim()) return; // Prevent empty discussions
		if (!userId) {
			setNotification("You must be logged in to post a discussion.");
			return;
		}

		try {
			await axios.post(
				`http://localhost:3001/route/products/${productId}/discussions`,
				{ title, content, userId }
			);

			// Re-fetch discussions after posting
			fetchDiscussionDetails();
			setNewDiscussion({ title: "", content: "" });
			setShowPostDiscussionForm(false);
		} catch (err) {
			console.error(
				"Error posting discussion:",
				err.response?.data || err
			);
		}
	};

	// Handle fetching a single discussion
	const fetchDiscussionDetails = async (discussionId) => {
		if (!discussionId) {
			console.error("Invalid discussionId");
			return;
		}

		try {
			const res = await axios.get(
				`http://localhost:3001/route/discussions/${discussionId}`
			);
			setSelectedDiscussion(res.data);
		} catch (err) {
			console.error(
				"Error fetching discussion details:",
				err.response?.data || err
			);
		}
	};

	// Handle posting a new comment to a discussion
	const handlePostComment = async (discussionId) => {
		const commentText = newComment[discussionId];
		if (!commentText) return;
		if (!userId) {
			setNotification("You must be logged in to post a comment.");
			return;
		}

		try {
			await axios.post(
				`http://localhost:3001/route/discussions/${discussionId}/comments`,
				{ text: commentText, userId }
			);

			// Re-fetch discussion details after posting comment
			fetchDiscussionDetails(discussionId);
			setNewComment((prev) => ({ ...prev, [discussionId]: "" }));
		} catch (err) {
			console.error("Error posting comment:", err.response?.data || err);
		}
	};

	const handlePostReply = async (discussionId, commentId) => {
		const replyTextValue = replyText[commentId];
		if (!replyTextValue) return;
		if (!userId) {
			setNotification("You must be logged in to post a reply.");
			return;
		}

		try {
			await axios.post(
				`http://localhost:3001/route/discussions/${discussionId}/comments/${commentId}/reply`,
				{ text: replyTextValue, userId }
			);

			// Re-fetch discussion details after posting reply
			fetchDiscussionDetails(discussionId);
			setReplyText((prev) => ({ ...prev, [commentId]: "" }));
		} catch (err) {
			console.error("Error posting reply:", err.response?.data || err);
		}
	};

	return (
		<div className="discussion-tab">
			<h2>Discussion Forum</h2>
			{notification && <Notification message={notification} />}
			{/* Display notification */}
			{/* Button to trigger the post discussion form */}
			<div className="toggle-post-discussion">
				<button
					onClick={() =>
						setShowPostDiscussionForm(!showPostDiscussionForm)
					}
				>
					{showPostDiscussionForm
						? "Cancel"
						: "Start a New Discussion"}
				</button>
			</div>
			{/* Conditionally render post discussion form */}
			{showPostDiscussionForm && (
				<div className="post-discussion-form">
					<input
						type="text"
						placeholder="Discussion title..."
						value={newDiscussion.title}
						onChange={(e) =>
							setNewDiscussion((prev) => ({
								...prev,
								title: e.target.value,
							}))
						}
					/>
					<textarea
						placeholder="Discussion content..."
						value={newDiscussion.content}
						onChange={(e) =>
							setNewDiscussion((prev) => ({
								...prev,
								content: e.target.value,
							}))
						}
						style={{
							width: "100%",
							padding: "10px",
							marginBottom: "10px",
							backgroundColor: "#333333",
							color: "#ffffff",
							border: "1px solid #444444",
							borderRadius: "4px",
						}}
					></textarea>

					<button onClick={handlePostDiscussion}>Post</button>
				</div>
			)}

			{/* Conditionally render either the discussion list or the selected discussion details */}
			{selectedDiscussion ? (
				<div className="discussion-details">
					<h3>{selectedDiscussion.title}</h3>
					<p>{selectedDiscussion.content}</p>
					<p>
						By: {selectedDiscussion.userId.username} | Created:{" "}
						{formatDistanceToNow(
							new Date(selectedDiscussion.createdAt),
							{
								addSuffix: true,
							}
						)}
					</p>

					{/* Comment section */}
					<div className="comments-section">
						<h4>Comments:</h4>
						{/* Map through comments */}
						{selectedDiscussion.comments?.length > 0 ? (
							selectedDiscussion.comments.map((comment) => (
								<Comment
									key={comment._id}
									comment={comment}
									handlePostReply={handlePostReply}
									replyText={replyText}
									setReplyText={setReplyText}
									cancelReply={cancelReply}
									setCancelReply={setCancelReply}
									userId={userId} // Pass userId to Comment
									setNotification={setNotification} // Pass setNotification to Comment
									discussionId={selectedDiscussion._id} // Pass discussionId to Comment
								/>
							))
						) : (
							<p>No comments yet.</p>
						)}
					</div>

					{/* Add new comment input */}
					<div className="add-comment">
						<h4>Add a Comment:</h4>
						<input
							type="text"
							placeholder="Add a comment..."
							value={newComment[selectedDiscussion._id] || ""}
							onChange={(e) =>
								setNewComment((prev) => ({
									...prev,
									[selectedDiscussion._id]: e.target.value,
								}))
							}
						/>
						<button
							onClick={() =>
								handlePostComment(selectedDiscussion._id)
							}
						>
							Post Comment
						</button>
					</div>

					{/* Back to discussions list */}
					<button onClick={() => setSelectedDiscussion(null)}>
						Back to Discussions
					</button>
				</div>
			) : (
				<div className="discussion-list">
					{discussions.length > 0 ? (
						discussions.map((discussion) => (
							<div
								key={discussion._id}
								className="discussion-item"
								onClick={() =>
									fetchDiscussionDetails(discussion._id)
								}
							>
								<h4>{discussion.title}</h4>
								<p>By: {discussion.username}</p>
								<p>
									Posted:{" "}
									{formatDistanceToNow(
										new Date(discussion.createdAt),
										{
											addSuffix: true,
										}
									)}
								</p>
							</div>
						))
					) : (
						<p>No discussions found for this product.</p>
					)}
				</div>
			)}
		</div>
	);
};

export default Discussions;
