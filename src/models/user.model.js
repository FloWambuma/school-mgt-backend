import { Schema, model } from "mongoose";

// create a user schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    role: {
      type: String,
      enum: ["LECTURER", "STUDENT"],
      required: true,
      default: "Student",
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default model("User", userSchema);
