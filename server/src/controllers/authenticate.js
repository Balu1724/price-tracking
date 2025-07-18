// authenticate.js (allow optional authentication)
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
	const authHeader = req.header("Authorization");
	if (!authHeader) {
		return next(); // No token provided, proceed as guest
	}
	try {
		const token = authHeader.replace("Bearer ", "");
		const decoded = jwt.verify(token, "secret");
		req.user = decoded; // Attach decoded data if token is valid
		next();
	} catch (error) {
		return res.status(401).json({ message: "Authentication failed" });
	}
};

module.exports = authenticate;
