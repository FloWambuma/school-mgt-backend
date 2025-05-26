import { Router } from "express";
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
} from "../services/assignment.service.js";
import protect from "../middleware/auth.middleware.js";
const router = Router();

router.route("").post(protect, createAssignment);
router.route("/").get(getAllAssignments); // public endpoint, everyone can see the assignments published
router
  .route("/:id")
  .get(protect, getAssignmentById) //
  .patch(protect, updateAssignment)
  .delete(protect, deleteAssignment);

export default router;
