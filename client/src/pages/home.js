import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Notification from "../component/Notification";
import "./Home.css";

export const Home = () => {
	const [cookies] = useCookies(["access_token"]);
	const [products, setProducts] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredProducts, setFilteredProducts] = useState([]);
	const [sortOption, setSortOption] = useState([]);
	const [notification, setNotification] = useState("");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [newProduct, setNewProduct] = useState({
		name: "",
		category: "",
		price: "",
		amazonUrl: "",
		flipkartUrl: "",
	});

	const navigate = useNavigate();

	useEffect(() => {
		if (cookies.access_token) {
			setIsAuthenticated(true);
		} else {
			setIsAuthenticated(false);
		}
	}, [cookies]);

	useEffect(() => {
		const fetchProducts = async () => {
			const apiData = await getProducts();
			setProducts(apiData.products);

			if (apiData.isAdmin) {
				setIsAdmin(true);
			}
		};
		fetchProducts();
	}, []);

	useEffect(() => {
		const filtered = products.filter((product) =>
			product.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
		sortProducts(filtered);
	}, [searchQuery, products, sortOption]);

	const getProducts = async () => {
		const options = {
			method: "GET",
			url: `http://localhost:3001/route/products`,
			headers: {
				accept: "application/json",
				...(cookies.access_token && {
					Authorization: `Bearer ${cookies.access_token}`,
				}),
			},
		};
		try {
			const response = await axios.request(options);
			return response.data;
		} catch (error) {
			console.log(error);
			return { products: [] };
		}
	};

	const handleSortChange = (event) => {
		setSortOption(event.target.value);
	};

	const sortProducts = (productsToSort) => {
		const sortedProducts = [...productsToSort];
		switch (sortOption) {
			case "name-asc":
				sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "name-desc":
				sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
				break;
			default:
				break;
		}
		setFilteredProducts(sortedProducts);
	};

	const redirectToProductDetails = (productID) => {
		navigate(`/products/${productID}`);
	};

	const handleProductChange = (e) => {
		const { name, value } = e.target;
		setNewProduct((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Ensure no fields are empty before submitting
		if (
			!newProduct.name ||
			!newProduct.category ||
			!newProduct.price ||
			!newProduct.amazonUrl ||
			!newProduct.flipkartUrl
		) {
			alert("Please fill all fields.");
			return;
		}

		const newProductData = {
			name: newProduct.name,
			category: newProduct.category,
			price: newProduct.price,
			amazonUrl: newProduct.amazonUrl,
			flipkartUrl: newProduct.flipkartUrl,
		};

		const token = cookies.access_token;

		try {
			const response = await axios.post(
				"http://localhost:3001/route/products",
				newProductData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.status === 201) {
				setProducts((prev) => [...prev, response.data]);
				setShowModal(false);
			}
		} catch (error) {
			console.error("Error creating product:", error);
		}
	};

	return (
		<div className="home">
			<header className="home-header">
				<h1>Knowledge Sharing Platform - Products</h1>
				{notification && (
					<Notification
						message={notification}
						onClose={() => setNotification("")}
					/>
				)}
				{isAdmin && (
					<div className="admin-notification">
						<p>Admin privileges enabled</p>
						
					</div>
				)}

				{isAdmin && (
					<button
						className="create-product-btn"
						onClick={() => setShowModal(true)}
					>
						Create New Product
					</button>
				)}
				<div className="filter-cont">
					<input
						type="text"
						placeholder="Search products..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<select value={sortOption} onChange={handleSortChange}>
						<option value="">Sort By</option>
						<option value="name-asc">Name: A-Z</option>
						<option value="name-desc">Name: Z-A</option>
					</select>
				</div>
			</header>

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h2>Create New Product</h2>
						<form onSubmit={handleSubmit}>
							<label>Name</label>
							<input
								type="text"
								name="name"
								value={newProduct.name}
								onChange={handleProductChange}
								required
							/>
							<label>Category</label>
							<input
								type="text"
								name="category"
								value={newProduct.category}
								onChange={handleProductChange}
								required
							/>
							<label>Price</label>
							<input
								type="number"
								name="price"
								value={newProduct.price}
								onChange={handleProductChange}
								required
							/>
							<label>Amazon URL</label>
							<input
								type="url"
								name="amazonUrl"
								value={newProduct.amazonUrl}
								onChange={handleProductChange}
								required
							/>
							<label>Flipkart URL</label>
							<input
								type="url"
								name="flipkartUrl"
								value={newProduct.flipkartUrl}
								onChange={handleProductChange}
								required
							/>
							<button type="submit">Create Product</button>
							<button
								type="button"
								className="close-btn"
								onClick={() => setShowModal(false)}
							>
								Close
							</button>
						</form>
					</div>
				</div>
			)}

			<div className="product-container">
				{filteredProducts.length > 0 ? (
					filteredProducts.map((product) => (
						<div
							className="product-box"
							key={product._id}
							onClick={() =>
								redirectToProductDetails(product._id)
							}
						>
							<h2>{product.name}</h2>
							<p>Category: {product.category}</p>
							<p>Price: ₹{product.price}</p>
						</div>
					))
				) : (
					<h2>No products to show</h2>
				)}
			</div>
		</div>
	);
};

export default Home;
