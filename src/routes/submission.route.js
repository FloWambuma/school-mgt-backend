import { Router } from "express";
import {
  submitAssignment,
  deleteSubmission,
  getSubmissionById,
  getSubmissionsByAssignment,
  gradeSubmission,
} from "../services/submission.service.js";
const router = Router();

router.route("/").post(submitAssignment);
router.route("/grade").patch(gradeSubmission);
router.route("/submission/:assignmentId")
  .get(getSubmissionsByAssignment); // fetch all submission made by students
router.route("/:id").get(getSubmissionById).delete(deleteSubmission);

export default router;
