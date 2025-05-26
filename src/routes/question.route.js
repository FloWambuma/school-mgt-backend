import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestionsByAssignment,
  updateQuestion,
} from "../services/question.service.js";
const router = Router();

router.route("/").post(createQuestion);
router.route("/assignment:/assignmentId").get(getQuestionsByAssignment);
router
  .route("/:id")
  .get(getQuestionById)
  .patch(updateQuestion)
  .delete(deleteQuestion);

export default router;
