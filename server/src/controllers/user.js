const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/users");

// Register User with Optional Admin Code
exports.registerUser = async (req, res) => {
	const { username, password, adminCode } = req.body;
	try {
		const user = await UserModel.findOne({ username });
		if (user) {
			return res.status(400).json({ message: "Username already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Check if the provided adminCode matches the secure code
		const role = adminCode === process.env.ADMIN_CODE ? "admin" : "user";

		const newUser = new UserModel({
			username,
			password: hashedPassword,
			role,
		});

		await newUser.save();
		res.status(201).json({
			message: "User registered successfully",
			user: newUser,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Login User and Return JWT with Role
exports.loginUser = async (req, res) => {
	const { username, password } = req.body;

	try {
		const user = await UserModel.findOne({ username });

		if (!user) {
			return res.status(400).json({ message: "Username does not exist" });
		}

		const isPassValid = await bcrypt.compare(password, user.password);
		if (!isPassValid) {
			return res.status(400).json({ message: "Incorrect Password" });
		}

		// Include the user's role in the JWT payload
		const token = jwt.sign({ id: user._id, role: user.role }, "secret");
		res.json({ token, id: user._id, role: user.role });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
