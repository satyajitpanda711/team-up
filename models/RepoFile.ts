// models/RepoFile.ts
import mongoose, { Schema, models } from "mongoose";

const RepoFileSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      index: true,
    },

    path: String,        // src/utils/auth.ts
    content: String,     // raw code
    language: String,    // ts, js, py
    size: Number,

    lastCommitSha: String,
  },
  { timestamps: true }
);

export default models.RepoFile ||
  mongoose.model("RepoFile", RepoFileSchema);
