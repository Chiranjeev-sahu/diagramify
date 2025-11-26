import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    resultingDiagramId: {
      type: Schema.Types.ObjectId,
      ref: "Diagram",
      default: null,
    },
  },
  { timestamps: true }
);

const chatSchema = new Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Diagram",
      trim: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Chat = model("Chat", chatSchema);
