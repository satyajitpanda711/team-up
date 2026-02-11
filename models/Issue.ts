// models/Issue.ts
import mongoose, { Schema, models } from "mongoose";

const IssueSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      index: true,
    },

    number: Number,
    title: String,
    body: String,
    state: String,
    labels: [String],
  },
  { timestamps: true }
);

export default models.Issue ||
  mongoose.model("Issue", IssueSchema);
