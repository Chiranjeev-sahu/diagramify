import { Schema, model } from "mongoose";

const diagramSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    promptText: {
      type: String,
      required: true,
      trim: true,
    },
    parentDiagramId: {
      type: Schema.Types.ObjectId,
      ref: "Diagram",
      default: null, // For conversational editing, links to the previous version
    },
    diagramType: {
      type: String,
      enum: ["Flowchart", "Sequence Diagram", "ER Diagram", "Gantt Chart"],
      required: true,
    },
    diagramData: {
      type: Schema.Types.Mixed, // Stores the JSON structure of the diagram
      required: true,
    },
    diagramCode: {
      type: String, // Stores raw code like Mermaid.js syntax
      required: true,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true },
);

export const Diagram = model("Diagram", diagramSchema);
