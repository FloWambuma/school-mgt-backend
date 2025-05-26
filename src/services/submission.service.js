import Submission from "../models/submissions.model.js";
import Assignment from "../models/assignment.model.js";
import Question from "../models/question.model.js";

// @desc Submit an assignment (with embedded answers)
// @route POST /api/submissions
// @access Private (Students only)
export const submitAssignment = async (req, res) => {
  const { answers } = req.body; // [{ questionId, studentAnswer, studentId, assignmentId }]
  const studentId = req.user.id;

  if (!answers || answers.length === 0) {
    return res.status(400).json({ message: "Answers are required!" });
  }

  const assignmentId = answers[0]?.assignmentId; // Assuming all answers are for one assignment
  if (!assignmentId) {
    return res.status(400).json({ message: "Assignment ID is required!" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId).populate(
      "questions"
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found!" });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId,
    });
    if (existingSubmission) {
      return res
        .status(400)
        .json({ message: "You have already submitted this assignment!" });
    }

    let totalScore = 0;

    for (const studentAnswerObj of answers) {
      const question = assignment.questions.find(
        (q) => q._id.toString() === studentAnswerObj.questionId
      );
      if (!question) continue;

      // Check if the student's answer matches the question's correctAnswer
      const isCorrect =
        studentAnswerObj.studentAnswer === question.correctAnswer;

      // Ensure question.score is a valid number
      const questionScore = isCorrect ? 1 : 0;

      totalScore += questionScore;
    }

    // Save submission
    const submission = await Submission.create({
      studentId,
      assignmentId,
      score: totalScore,
    });

    return res.status(201).json({
      message: "Assignment submitted successfully!",
      score: totalScore,
      submission,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to submit assignment!" });
  }
};

// @desc Get all submissions for an assignment
// @route GET /api/submissions/assignment/:assignmentId
// @access Private (Lecturers only)
export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignmentId: req.params.assignmentId,
    })
      .populate("studentId", "username") // Show student name
      .populate("questions")
      .lean();

    return res.status(200).json(submissions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch submissions!" });
  }
};

// @desc Get a student's submission for an assignment
// @route GET /api/submissions/:id
// @access Private (Lecturers & Students)
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("assignmentId", "title")
      .populate("studentId", "username")
      .lean();

    if (!submission) {
      return res.status(404).json({ message: "Submission not found!" });
    }

    return res.status(200).json(submission);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch submission!" });
  }
};

// @desc Update submission score (grading process)
// @route PUT /api/submissions/:id/grade
// @access Private (Lecturers only)
export const gradeSubmission = async (req, res) => {
  try {
    const gradedAnswers = req.body; // Array of answers with scores
    const submissionId = gradedAnswers[0].submissionId; // Submission ID

    // Step 1: Find the submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found!" });
    }

    // Step 2: Update each answer's score
    for (const answer of gradedAnswers) {
      await Answer.findByIdAndUpdate(answer.answerId, {
        score: Number(answer.score),
      });
    }

    // Step 3: Recalculate the total score
    const updatedAnswers = await Answer.find({ submissionId });
    const totalScore = updatedAnswers.reduce((sum, ans) => sum + ans.score, 0);

    // Step 4: Update submission's total score
    submission.score = totalScore;
    await submission.save();

    return res.status(200).json({
      message: "Submission graded successfully!",
      totalScore,
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return res.status(500).json({ message: "Failed to grade submission!" });
  }
};

// @desc Delete a submission
// @route DELETE /api/submissions/:id
// @access Private (Lecturers only)
export const deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found!" });
    }

    await Answer.deleteMany({ submissionId: submission._id }); // Remove associated answers
    await Submission.deleteOne({ _id: req.params.id });

    return res
      .status(200)
      .json({ message: "Submission deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete submission!" });
  }
};
