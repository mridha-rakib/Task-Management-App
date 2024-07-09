import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

// @desc Auth user & get token
// @route POST /api/users/login
// @access public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user?.isActive) {
    res.status(401);
    throw new Error(
      "User account has been deactivated, contact the administrator"
    );
  }

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest);
  } else {
    res.status(401);
    throw new Error("Invalid login credentials");
  }
});

// @desc Register user
// @route POST /api/users
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, isAdmin, role, title } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  try {
    const user = await new User.create({ username, email, password });

    if (user) {
      isAdmin ? generateToken(res, user._id) : null;

      const { password: pass, ...rest } = user._doc;

      res.status(201).json(rest);
    } else {
      res.status(401);
      throw new Error("Invalid login credentials");
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res
        .status(400)
        .send({ message: `Duplicate key error: ${field} already exists.` });
    }
    throw error;
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

export { registerUser, authUser, logoutUser };
