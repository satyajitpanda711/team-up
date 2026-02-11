// models/PullRequest.ts
import mongoose, { Schema, models } from "mongoose";

const PullRequestSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      index: true,
    },

    number: Number,
    title: String,
    body: String,
    state: String, // open / closed
    merged: Boolean,
  },
  { timestamps: true }
);

export default models.PullRequest ||
  mongoose.model("PullRequest", PullRequestSchema);
