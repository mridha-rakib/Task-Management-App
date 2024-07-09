import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { isAdmin } = req.user;
  const { _id } = req.body;

  const id =
    isAdmin && userId === _id
      ? userId
      : isAdmin && userId !== _id
      ? _id
      : userId;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update the user profile with provided values or fallback to existing values
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        username: req.body.name || user.name,
        title: req.body.title || user.title,
        role: req.body.role || user.role,
      },
    },
    { new: true, runValidators: true }
  );

  const { password, ...rest } = updatedUser._doc;

  res.status(201).json({
    message: "Profile Update Successfully.",
    ...rest,
  });
});

const getTeamList = asyncHandler(async (req, res) => {
  const users = await User.find().select("name title role email isActive");
  res.status(200).json(users);
});

const getNotificationsList = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notice = await Notice.find({
    team: userId,
    isRead: { $nin: [userId] },
  }).populate("task", "title");

  res.status(201).json(notice);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { isReadType, id } = req.query;

  if (isReadType === "all") {
    await Notice.updateMany(
      {
        team: userId,
        isRead: { $nin: [userId] },
      },
      { $push: { isRead: userId } },
      { new: true }
    );
  }
  res.status(201).json({ status: true, message: "Done" });
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.password = req.body.password;

  await user.save();

  user.password = undefined;

  res.status(201).json({
    status: true,
    message: `Password chnaged successfully.`,
  });
});

const activateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.isActive = req.body.isActive;
  await user.save();

  res.status(201).json({
    status: true,
    message: `User account has been ${
      user?.isActive ? "activated" : "disabled"
    }`,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error("You are not allowed to delete this user");
  }
  const { id } = req.params;

  await User.findByIdAndDelete(id);

  res.status(200).json({ status: true, message: "User deleted successfully" });
});

// const getUsers = asyncHandler(async (req, res) => {
//   if (!req.user.isAdmin) {
//     return next(errorHandler(403, "You are not allowed to see all users"));
//   }

//   const { startIndex = 0, limit = 9, sort = "asc" } = req.query;
//   const sortDirection = sort === "asc" ? 1 : -1;

//   const [users, totalUsers] = await Promise.all([
//     User.find()
//       .sort({ createdAt: sortDirection })
//       .skip(startIndex)
//       .limit(limit)
//       .select("-password"),
//     User.countDocuments(),
//   ]);

//   const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
//   const lastMonthUsers = await User.countDocuments({
//     createdAt: { $gte: oneMonthAgo },
//   });

//   // Respond with data
//   res.status(200).json({
//     users,
//     totalUsers,
//     lastMonthUsers,
//   });
// });

export { updateUserProfile, deleteUser, signOut, getUsers };
