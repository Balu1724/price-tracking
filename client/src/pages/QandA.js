import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode }from "jwt-decode"; // Correct import
import Notification from "../component/Notification.js"; // Import the Notification component
import "./QandA.css"; // Import CSS

const QandA = () => {
	const [questions, setQuestions] = useState([]);
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [answerContent, setAnswerContent] = useState("");
	const [newQuestion, setNewQuestion] = useState("");
	const [notification, setNotification] = useState("");
	const { productId } = useParams();
	const [cookies] = useCookies(["access_token"]);
	const userId = localStorage.getItem("userID");
	const [role, setRole] = useState("");

	// Function to check role from the token stored in cookies
	const checkRole = async () => {
		if (cookies.access_token) {
			try {
				const decoded = jwtDecode(cookies.access_token);
				if (decoded && decoded.role) {
					setRole(decoded.role);
				} else {
					setNotification("Role not found. Please login again.");
				}
			} catch (error) {
				setNotification("Failed to decode token. Please login again.");
			}
		}
	};

	// Fetch all questions for a product
	const fetchQuestions = async () => {
		try {
			const response = await axios.get(
				`http://localhost:3001/route/products/${productId}/questions`
			);
			const questionsWithHighlight = response.data.map((question) => ({
				...question,
				highlight: !question.answers || question.answers.length === 0,
			}));
			setQuestions(questionsWithHighlight);
		} catch (error) {
			setNotification("No questions.");
		}
	};

	useEffect(() => {
		checkRole();
		fetchQuestions();
	}, [productId, role]);

	// Handle question submission (User role)
	const handleQuestionSubmit = async () => {
		if (!userId) {
			setNotification("Please log in to post a question.");
			return;
		}
		try {
			const response = await axios.post(
				`http://localhost:3001/route/products/${productId}/questions`,
				{ content: newQuestion, userId },
				{ headers: { Authorization: `Bearer ${cookies.access_token}` } }
			);
			setQuestions([...questions, response.data.question]);
			setNewQuestion("");
		} catch (error) {
			setNotification("Log in to post question.");
		}
	};

	// Handle answer submission (Admin role)
	const handleAnswerSubmit = async (questionId) => {
		if (!answerContent) {
			setNotification("Please enter an answer.");
			return;
		}

		const question = questions.find((q) => q._id === questionId);

		// Check if the question already has answers
		if (question.answers && question.answers.length > 0) {
			setNotification("This question already has an answer.");
			return;
		}

		try {
			const response = await axios.post(
				`http://localhost:3001/route/products/${productId}/answer`,
				{ questionId, content: answerContent },
				{ headers: { Authorization: `Bearer ${cookies.access_token}` } }
			);
			setQuestions(
				questions.map((q) =>
					q._id === questionId
						? {
								...q,
								answers: [...q.answers, response.data.answer],
						  }
						: q
				)
			);
			setAnswerContent("");
		} catch (error) {
			setNotification("Failed to submit answer.");
		}
	};

	// Handle selecting a question to view answers
	const handleQuestionSelect = (question) => {
		setSelectedQuestion(question);
	};

	// Handle canceling the question selection (admin cancel button)
	const handleCancelAnswer = () => {
		setSelectedQuestion(null);
		setAnswerContent("");
	};

	return (
		<div className="qanda-section">
			<h2>Questions & Answers</h2>

			{/* Notification display */}
			{notification && (
				<Notification
					message={notification}
					onClose={() => setNotification("")}
				/>
			)}

			{/* Display question list */}
			<div className="question-list">
				{questions.map((question) => (
					<div
						key={question._id}
						className={`question-item ${
							question.highlight ? "highlight" : ""
						}`}
						onClick={() => handleQuestionSelect(question)}
					>
						<p>{question.content}</p>
					</div>
				))}
			</div>

			{/* Display selected question with answers */}
			{selectedQuestion && (
				<div className="answer-section">
					<h3>Question: {selectedQuestion.content}</h3>
					<div className="answer-list">
						{selectedQuestion.answers &&
						selectedQuestion.answers.length > 0 ? (
							selectedQuestion.answers.map((answer, idx) => (
								<p key={idx}>{answer.content}</p>
							))
						) : (
							<p>No answers yet.</p>
						)}
					</div>

					{/* Admin answer input */}
					{role === "admin" && (
						<div className="answer-box">
							<input
								type="text"
								placeholder="Write an answer..."
								value={answerContent}
								onChange={(e) =>
									setAnswerContent(e.target.value)
								}
								disabled={
									selectedQuestion.answers &&
									selectedQuestion.answers.length > 0
								}
							/>
							<button
								onClick={() =>
									handleAnswerSubmit(selectedQuestion._id)
								}
								disabled={
									selectedQuestion.answers &&
									selectedQuestion.answers.length > 0
								}
							>
								Submit Answer
							</button>
							<button onClick={handleCancelAnswer}>Cancel</button>
						</div>
					)}
				</div>
			)}

			{/* Post question if user is logged in and not admin */}
			{userId && role !== "admin" && (
				<div className="post-question">
					<textarea
						placeholder="Ask a question..."
						value={newQuestion}
						onChange={(e) => setNewQuestion(e.target.value)}
					/>
					<button onClick={handleQuestionSubmit}>
						Post Question
					</button>
				</div>
			)}
		</div>
	);
};

export default QandA;
