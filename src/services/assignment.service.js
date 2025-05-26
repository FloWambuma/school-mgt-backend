import Assignment from "../models/assignment.model.js";
import Question from "../models/question.model.js";

// @desc Create a new assignment
// @route POST /api/assignments
// @access Private (Lecturers only)
export const createAssignment = async (req, res) => {
  const { title, description, courseName, startDate, endDate, questions } =
    req.body;
  const lecturerId = req.user.id; // user from auth middleware

  if (
    !title ||
    !courseName ||
    !startDate ||
    !endDate ||
    !questions ||
    questions.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided!" });
  }

  try {
    // Step 1: Create the assignment
    const assignment = await Assignment.create({
      lecturerId,
      title,
      description,
      courseName,
      startDate,
      endDate,
    });

    // Step 2: Create questions linked to the assignment
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({
        ...q,
        assignmentId: assignment._id, // Link question to the assignment
      }))
    );

    // Step 3: Update the assignment with question IDs
    assignment.questions = createdQuestions.map((q) => q._id);
    await assignment.save();

    return res
      .status(201)
      .json({ message: "Assignment created successfully!", assignment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create assignment with questions." });
  }
};

// @desc Get all assignments
// @route GET /api/assignments
// @access Private (Lecturers & Students)
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("questions").lean();
    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assignments!" });
  }
};

// @desc Get a single assignment by ID
// @route GET /api/assignments/:id
// @access Private (Lecturers & Students)
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("questions")
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found!" });
    }

    return res.status(200).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assignment!" });
  }
};

// @desc Update an assignment
// @route PUT /api/assignments/:id
// @access Private (Lecturers only)
export const updateAssignment = async (req, res) => {
  const {
    title,
    description,
    courseName,
    courseCode,
    startDate,
    endDate,
    questions,
  } = req.body;

  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        courseName,
        courseCode,
        startDate,
        endDate,
        questions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAssignment) {
      return res.status(404).json({ message: "Assignment not found!" });
    }

    return res.status(200).json(updatedAssignment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update assignment!" });
  }
};

// @desc Delete an assignment
// @route DELETE /api/assignments/:id
// @access Private (Lecturers only)
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found!" });
    }

    await Assignment.deleteOne({ _id: req.params.id });

    return res
      .status(200)
      .json({ message: "Assignment deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete assignment!" });
  }
};
