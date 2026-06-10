"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuestionSchema = new mongoose_1.Schema({
    project: {
        type: mongoose_1.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },
    askedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    answer: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "answered"],
        default: "pending",
    },
}, { timestamps: true });
exports.default = mongoose_1.models.Question || (0, mongoose_1.model)("Question", QuestionSchema);
