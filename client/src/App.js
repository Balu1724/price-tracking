import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Auth } from "./pages/auth";
import ProductDetails from "./pages/ProductDetails";
// import { PostRecipe } from "./pages/post_recipe";
// import { MyRecipe } from "./pages/my_recipe";
// import { SavedRecipe } from "./pages/saved_Recipe";
import Bar from "./component/bar";

function App() {
	return (
		<div className="App">
			<Router>
				<Bar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/auth" element={<Auth />} />
					<Route
						path="/products/:productId"
						element={<ProductDetails />}
					/>
					{/* <Route path="/post_recipe" element={<PostRecipe />} />
					<Route path="/my_recipe" element={<MyRecipe />} />
					<Route path="/saved_Recipe" element={<SavedRecipe />} /> */}
				</Routes>
			</Router>
		</div>
	);
}

export default App;
