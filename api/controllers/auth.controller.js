import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

// @desc Auth user & get token
// @route POST /api/users/login
// @access public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

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
  const { username, email, password } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await new User({ username, email, password });

  try {
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
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

// const google = asyncHandler(async (req, res) => {
//   const { email, name, googlePhotoUrl } = req.body;

//   const user = await User.findOne({ email });

//   if (user) {
//     generateToken(res, user._id);
//     const { password, ...rest } = user._doc;
//     res.status(200).json(rest);
//   } else {
//     const generatedPassword =
//       Math.random().toString(36).slice(-8) +
//       Math.random().toString(36).slice(-8);

//     const newUser = User.create({
//       username:
//         name.toLowerCase().split(" ").join("") +
//         Math.random().toString(9).slice(-4),
//       email,
//       password: generatedPassword,
//       profilePicture: googlePhotoUrl,
//     });

//     generateToken(res, newUser._id);

//     const { password, ...rest } = newUser._doc;

//     res.status(200).json(rest);
//   }
// });

export { registerUser, authUser };
