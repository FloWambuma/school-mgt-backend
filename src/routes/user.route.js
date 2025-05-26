import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  deleteUser,
  getAllUsersResults
} from "../services/user.service.js";
import protect from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser); // non protected route
router.route("/login").post(loginUser); // non protected route
router.route("/profile").get(protect, getUserProfile); // non protected route
router.route("/").get(protect, getAllUsers); // protected route
router.route("/results/:assignmentId").get(getAllUsersResults); // protected route
 router.route("/:id").delete(protect, deleteUser); // protected route

export default router;
