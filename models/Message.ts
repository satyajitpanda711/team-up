import mongoose, { Schema } from "mongoose"

const MessageSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

MessageSchema.index({ project: 1, createdAt: -1 })

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema)
