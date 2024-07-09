import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createTask,
  getTask,
  deleteTask,
  updateTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create-task", protect, admin, createTask);
router.get("/getTask", getTask);
router.delete("/deletetask/:taskId/:userId", protect, deleteTask);
router.put("/updatask/:taskId/:userId", protect, admin, updateTask);

export default router;
