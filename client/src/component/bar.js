import React from "react";
// import logo from "../img/logo.jpg";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavigationBar.css";

const Bar = () => {
	const [cookies, setCookies, removeCookies] = useCookies(["access_token"]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const userID = window.localStorage.getItem("userID");
		if (userID) {
			setIsLoggedIn(true); // Set the state based on userID presence
		} else {
			setIsLoggedIn(false); // If no userID, assume the user is not logged in
		}
	}, []);

	const logout = () => {
		// Clear cookies and localStorage when user clicks logout
		removeCookies("access_token", { path: "/" });  // Ensure the cookie path is specified
		window.localStorage.removeItem("userID");
		setIsLoggedIn(false);
		navigate("/");  // Redirect to the homepage after logout
	};
	
	return (
		<div className="js-navigation-container">
			<nav className="nav">
				<div class="logo-container">
					{/* <img src={logo} alt="Logo" /> */}
					<label>E-Kms</label>
				</div>
				<Link to="/">Home</Link>
				{/* <Link to="/post_recipe">Add Recipe</Link> */}
				<Link to="/saved_recipe">Saved Products</Link>
				{/* <Link to="/my_recipe">My Recipes</Link> */}
				{/* {!cookies.access_token ? (
					<Link to="/auth">Login / Register</Link>
				) : (
					<button className="log-btn" onClick={logout}>
						Logout
					</button>
				)} */}
				{!cookies.access_token ? (
					<Link to="/auth">Login / Register</Link>
				) : (
					<button className="log-btn" onClick={logout}>
						Logout
					</button>
				)}
			</nav>
		</div>
	);
};

export default Bar;
