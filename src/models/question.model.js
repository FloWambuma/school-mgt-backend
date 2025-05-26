import { Schema, model } from "mongoose";

// create an assignments question schema
const questionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    question: { type: String, required: true },
    // description: { type: String },
    correctAnswer: { type: Number, required: true }, // Maximum score for the question

    // 📝 Multiple-choice answers
    options: [],
  },
  {
    timestamps: true,
  }
);

export default model("Question", questionSchema);
