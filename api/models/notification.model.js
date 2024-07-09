import { text } from "express";
import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    team: [
      {
        type: Schema.Types.ObjectId,
        ref: "user.model",
      },
    ],
    text: { type: String },
    task: { type: Schema.Types.ObjectId, ref: "task.model" },
    notiType: { type: String, default: "alert", enum: ["alert", "message"] },
    isRead: [{ type: Schema.Types.ObjectId, ref: "user.model" }],
  },
  { timestamps: true }
);

const Notice = mongoose.model("Notice", notificationSchema);

export default Notice;
