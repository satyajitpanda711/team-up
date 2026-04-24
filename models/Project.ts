import mongoose, { Schema, models } from "mongoose";

const ProjectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // 👈 IMPORTANT
            trim: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                user: { type: Schema.Types.ObjectId, ref: "User" },
                role: {
                    type: String,
                    enum: ["owner", "developer"],
                    default: "developer",
                },
            },
        ],

        // One repo per project (for now)
        repository: {
            type: Schema.Types.ObjectId,
            ref: "Repository",
        },

        githubRepoUrl: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default models.Project ||
    mongoose.model("Project", ProjectSchema);
