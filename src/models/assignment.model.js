import { Schema, model } from "mongoose";

// create a assignment schema
const assignmentSchema = new Schema(
  {
    lecturerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseName: { type: String, required: true }, // Course details stored in the assignment
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ], // Linked questions
  },
  {
    timestamps: true,
  }
);

export default model("Assignment", assignmentSchema);
