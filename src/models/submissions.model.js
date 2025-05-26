import { Schema, model } from "mongoose";

// create a students submissions schema
const submissionsSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: { type: Number, default: 0 }, // Total score given by lecturer
  },
  {
    timestamps: true,
  }
);

export default model("Submission", submissionsSchema);
