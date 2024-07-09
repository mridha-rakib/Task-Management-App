import express from "express";
const router = express.Router();
import {
  updateUserProfile,
  signOut,
  deleteUser,
  getUsers,
} from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.put("/update/:userId", protect, updateUserProfile);
router.post("/signout", signOut);
router.delete("/delete/:userId", protect, admin, deleteUser);
router.get("/getusers", protect, admin, getUsers);

export default router;
