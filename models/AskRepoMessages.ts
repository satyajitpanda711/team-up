// const askRepoMessage = new AskRepoMessage({
//     projectId,
//     repository: repository._id,
//     user: userData?._id,
//     username,
//     question,
//     answer,
//     answered: true,
//   });

import mongoose from "mongoose";

const AskRepoMessageSchema = new mongoose.Schema(
  {
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },
    repository: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "User",
    },
    username: String,
    question: String,
    answer: String,
    answered: {
        type: Boolean,
        default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AskRepoMessage ||
  mongoose.model("AskRepoMessage", AskRepoMessageSchema);
