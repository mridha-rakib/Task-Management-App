import Task from "../models/task.model.js";
import asyncHandler from "../middleware/asyncHandler.js";

const createTask = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error("You are not allowed to create a post");
  }

  if (!req.body.title || !req.body.description) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }
});

const getPosts = asyncHandler();

const deletePost = asyncHandler();

const updatePost = asyncHandler();
