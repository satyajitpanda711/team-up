import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: String,

    githubId: String,

    githubAccessToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
