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
    language: String,    // typescript, javascript, python, etc.
    size: Number,
    depth: Number,       // Directory depth for architectural mapping

    lastCommitSha: String,
  },
  { timestamps: true }
);

export default models.RepoFile ||
  mongoose.model("RepoFile", RepoFileSchema);
