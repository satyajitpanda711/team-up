// models/Commit.ts
import mongoose, { Schema, models } from "mongoose";

const CommitSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      index: true,
    },

    sha: String,
    message: String,
    author: String,
    date: Date,
  },
  { timestamps: true }
);

export default models.Commit ||
  mongoose.model("Commit", CommitSchema);
