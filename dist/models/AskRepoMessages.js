"use strict";
// const askRepoMessage = new AskRepoMessage({
//     projectId,
//     repository: repository._id,
//     user: userData?._id,
//     username,
//     question,
//     answer,
//     answered: true,
//   });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AskRepoMessageSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },
    repository: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    username: String,
    question: String,
    answer: String,
    answered: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.models.AskRepoMessage ||
    mongoose_1.default.model("AskRepoMessage", AskRepoMessageSchema);
