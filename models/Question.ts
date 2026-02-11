import { Schema, model, models, Types } from "mongoose"

const QuestionSchema = new Schema(
  {
    project: {
      type: Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    askedBy: {
      type: Types.ObjectId,
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
  },
  { timestamps: true }
)

export default models.Question || model("Question", QuestionSchema)
