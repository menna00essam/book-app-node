const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
};

const sanitizeUser = (user) => {
  return {
    id: user._id,
    uid: user.uid,
    name: user.name,
    email: user.email,
    role: user.role,
    age: user.age,
    books_bought_amount: user.books_bought_amount,
  };
};

const registerUser = async (req, res) => {
  const { name, email, password, age } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = await User.create({ name, email, password, age });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      device: device || "Unknown Device",
      ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, isDeleted: false }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      device: device || "Unknown Device",
      ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: sanitizeUser(user),
      accessToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": token,
      isDeleted: false,
    }).select("-password");

    if (!user) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh Token Error:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    if (err.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ message: "Refresh token expired, please login again" });
    }

    return res
      .status(500)
      .json({ message: "Server error during token refresh" });
  }
};

const logoutUser = async (req, res) => {
  const token = req.cookies.refreshToken;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const device = req.body.device || "Unknown Device";

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.refreshTokens = user.refreshTokens.filter(
    rt => !(rt.token === token || (rt.device === device && rt.ip === ip))
  );

  await user.save();
  res.status(200).json({ message: "Logged out from this device" });
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        books_bought_amount: user.books_bought_amount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getUserProfile,
};
