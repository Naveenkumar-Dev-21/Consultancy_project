import User from "../models/User.js";
import GoogleUser from "../models/GoogleUser.js";
import jwt from "jsonwebtoken";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ error: "User already exists" });

  const user = await User.create({ name, email, password });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  });
};

export const googleAuth = async (req, res) => {
  const { googleId, email, name, picture } = req.body;

  let user = await GoogleUser.findOne({ googleId });

  if (!user) {
    user = await GoogleUser.create({
      googleId,
      email,
      name,
      picture
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    token: generateToken(user._id)
  });
};
