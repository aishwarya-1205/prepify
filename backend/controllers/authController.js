

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d"});
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = 
        req.body;

        //Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists!" });
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Create new User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl

        });

        //Return User data with JWT
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profuleImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json( { message: "Server Error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            res.status(500).json( { message: "Invalid Email or Password" });
        }

        //Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            res.status(500).json( { message: "Invalid Email or Password" });
        }

        //Return User data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profuleImageUrl,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json( { message: "Server Error", error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json( { message: "Server Error", error: error.message });
    }

};

module.exports = { registerUser, loginUser, getUserProfile };