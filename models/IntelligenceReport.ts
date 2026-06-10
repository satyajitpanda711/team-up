import mongoose, { Schema, models } from "mongoose";

const IntelligenceReportSchema = new Schema(
  {
    repository: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    reportData: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.IntelligenceReport ||
  mongoose.model("IntelligenceReport", IntelligenceReportSchema);
