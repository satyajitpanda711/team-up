// models/Repository.ts
import mongoose, { Schema, models } from "mongoose";


const RepositorySchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    githubId: {
      type: Number,
      required: true,
    },

    owner: String,
    name: String,
    fullName: String,
    url: String,
    isPrivate: Boolean,
    defaultBranch: String,
    tree: {
      type: {},
      default: {},
    },
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

// Prevent same repo being added twice to same project
RepositorySchema.index({ projectId: 1, githubId: 1 }, { unique: true });

export default models.Repository ||
  mongoose.model("Repository", RepositorySchema);
