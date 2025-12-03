import { Schema, model } from "mongoose";

const diagramSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true, 
    },
    promptText: {
      type: String,
      required: true,
      trim: true,
    },
    title:{
      type:String,
      default:"Untitled Diagram",
      trim:true
    },
    parentDiagramId: {
      type: Schema.Types.ObjectId,
      ref: "Diagram",
      default: null,
    },
    diagramType: {
      type: String,
      enum: ["Flowchart", "Sequence", "ER", "Gantt"],
      required: true,
    },
    diagramData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    diagramCode: {
      type: String,
      required: true,
    },
    isSaved: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

export const Diagram = model("Diagram", diagramSchema);
