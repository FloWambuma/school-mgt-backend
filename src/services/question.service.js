import Question from "../models/question.model.js";
import Assignment from "../models/assignment.model.js";

// @desc Create a new question with embedded answers
export const createQuestion = async (req, res) => {
  const { assignmentId, question, options, correctAnswer } = req.body;

  if (!assignmentId || !question || !Array.isArray(options)) {
    return res
      .status(400)
      .json({ message: "All fields including options are required!" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found!" });
    }

    const newQuestion = await Question.create({
      assignmentId,
      question,
      options,
      correctAnswer,
    });

    await Assignment.findByIdAndUpdate(
      assignment._id,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    return res.status(201).json(newQuestion);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create question!" });
  }
};

// @desc Get all questions for an assignment
export const getQuestionsByAssignment = async (req, res) => {
  try {
    const questions = await Question.find({
      assignmentId: req.params.assignmentId,
    }).lean();
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch questions!" });
  }
};

// @desc Get a single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found!" });
    }

    return res.status(200).json(question);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch question!" });
  }
};

// @desc Update a question including answers
export const updateQuestion = async (req, res) => {
  const { title, correctAnswer, answers } = req.body;

  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found!" });
    }

    const data = {
      ...question,
      title,
      correctAnswer,
      answers,
    };

    await data.save();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update question!" });
  }
};

// @desc Delete a question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found!" });
    }

    await Question.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: "Question deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete question!" });
  }
};
