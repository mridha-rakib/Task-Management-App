import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";

const updateUserProfile = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.userId) {
    res.status(401);
    throw new Error("You are not allowed to update this user");
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user profile with provided values or fallback to existing values
  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    {
      $set: {
        username: req.body.username || user.username,
        email: req.body.email || user.email,
        profilePicture: req.body.profilePicture || user.profilePicture,
        password: req.body.password || user.password,
      },
    },
    { new: true, runValidators: true }
  );

  const { password, ...rest } = updatedUser._doc;

  res.status(200).json(rest);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin && req.user._id.toString() !== req.params.userId) {
    res.status(403);
    throw new Error("You are not allowed to delete this user");
  }

  await User.findByIdAndDelete(req.params.userId);
  res.status(200).json("User has been deleted");
});

const signOut = asyncHandler(async (req, res) => {
  res.clearCookie("access_token").status(200).json("User has been signed out");
});

const getUsers = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }

  const { startIndex = 0, limit = 9, sort = "asc" } = req.query;
  const sortDirection = sort === "asc" ? 1 : -1;

  const [users, totalUsers] = await Promise.all([
    User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .select("-password"),
    User.countDocuments(),
  ]);

  const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const lastMonthUsers = await User.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  // Respond with data
  res.status(200).json({
    users,
    totalUsers,
    lastMonthUsers,
  });
});

export { updateUserProfile, deleteUser, signOut, getUsers };
