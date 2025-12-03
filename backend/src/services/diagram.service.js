import crypto from "crypto";
import { Diagram } from "../models/diagram.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { classifyPromptDiagramTypes } from "./ai/classifier.js";
import { generateDiagramData } from "./ai/generator.js";
import {
  convertERDiagramDataToMermaid,
  convertFlowchartDataToMermaid,
  convertGanttChartDataToMermaid,
  convertSequenceDiagramDataToMermaid,
  diagramDataToMermaidCode,
} from "../utils/diagram.converter.js";
import { interpretPromptToInstruction, manipulateDiagramData } from "./ai/manipulator.js";

export const createDiagramFromPrompt = async (userId, prompt) => {
  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  if (!escapedPrompt) {
    throw new Error("Prompt text required");
  }

  const relevantTypes = await classifyPromptDiagramTypes(escapedPrompt);

  if (!relevantTypes || relevantTypes.length === 0) {
    return [];
  }

  const generationPromises = relevantTypes.map((type) =>
    generateDiagramData(escapedPrompt, type)
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedDiagramData = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (generatedDiagramData.length === 0) {
    throw new Error("AI failed to generate any diagrams");
  }

  const saveDiagrams = generatedDiagramData.map(async (diagramData) => {
    if (!diagramData) return null;

    const diagramCode = convertDiagramDataToMermaid(diagramData);
    if (!diagramCode) return null;

    const chatId = crypto.randomUUID();

    const newDiagram = await Diagram.create({
      userId,
      chatId,
      promptText: prompt,
      parentDiagramId: null,
      diagramType: diagramData.diagramType,
      diagramData,
      diagramCode,
      title: diagramData.title,
      version: 1,
    });

    await Chat.create({
      chatId,
      userId,
      title: diagramData.title,
      messages: [
        {
          role: "user",
          content: prompt,
          resultingDiagramId: null,
        },
        {
          role: "assistant",
          content: `I've created a ${diagramData.diagramType} diagram for you! Feel free to ask me to make any changes or adjustments you'd like.`,
          resultingDiagramId: newDiagram._id,
        },
      ],
    });

    return newDiagram;
  });

  const createdDiagrams = (await Promise.all(saveDiagrams)).filter(Boolean);
  const diagramIds = createdDiagrams.map((doc) => doc._id);

  if (diagramIds.length > 0) {
    await User.findByIdAndUpdate(userId, {
      $push: {
        diagramsGenerated: {
          $each: diagramIds,
        },
      },
    });
  }

  return createdDiagrams;
};

export const createNewDiagramVersion = async (userId, parentDiagramId, newPrompt) => {
  const escapedNewPrompt = newPrompt.prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  if (!escapedNewPrompt) {
    throw new Error("Re-prompt text is required");
  }

  const parentDiagram = await Diagram.findById(parentDiagramId);
  if (!parentDiagram) {
    throw new Error("Original diagram not found");
  }

  if (parentDiagram.userId.toString() !== userId.toString()) {
    throw new Error("You are not authorized to edit this diagram");
  }

  const current_diagramData = parentDiagram.diagramData;
  const current_version = parentDiagram.version;

  const structured_instruction = await interpretPromptToInstruction(
    escapedNewPrompt,
    current_diagramData
  );

  const new_diagramData = await manipulateDiagramData(
    current_diagramData,
    structured_instruction
  );

  const new_diagramCode = diagramDataToMermaidCode(new_diagramData);
  const chatId = parentDiagram.chatId;

  const newDiagramVersion = await Diagram.create({
    userId,
    chatId,
    promptText: newPrompt.prompt,
    parentDiagramId,
    diagramType: parentDiagram.diagramType,
    diagramData: new_diagramData,
    diagramCode: new_diagramCode,
    title: new_diagramData.title || parentDiagram.title,
    version: current_version + 1,
  });

  await Chat.findOneAndUpdate(
    { chatId },
    {
      $set: {
        title: new_diagramData.title || parentDiagram.title,
      },
      $push: {
        messages: {
          $each: [
            {
              role: "user",
              content: newPrompt.prompt,
              resultingDiagramId: null,
            },
            {
              role: "assistant",
              content: `Updated to version ${current_version + 1}`,
              resultingDiagramId: newDiagramVersion._id,
            },
          ],
        },
      },
    }
  );

  await User.findByIdAndUpdate(userId, {
    $push: { diagramsGenerated: newDiagramVersion._id },
  });

  return newDiagramVersion;
};

export const getLatestDiagramVersions = async (userId) => {
  const latestVersions = await Diagram.aggregate([
    { $match: { userId } },
    { $sort: { version: -1 } },
    {
      $group: {
        _id: "$chatId",
        latestDiagram: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$latestDiagram" } },
    { $sort: { updatedAt: -1 } },
  ]);

  return latestVersions;
};

export const getDiagramById = async (userId, diagramId) => {
  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new Error("Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new Error("You are not authorized to view this diagram");
  }

  return diagram;
};

export const deleteDiagramFamily = async (userId, diagramId) => {
  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new Error("Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new Error("Forbidden");
  }

  const chatId = diagram.chatId;

  const diagramsToDelete = await Diagram.find({
    chatId,
    userId,
  }).select("_id");
  const deletedIds = diagramsToDelete.map((d) => d._id);

  const deleteResult = await Diagram.deleteMany({
    chatId,
    userId,
  });

  await Chat.findOneAndDelete({ chatId, userId });

  await User.findByIdAndUpdate(userId, {
    $pull: {
      diagramsGenerated: { $in: deletedIds },
    },
  });

  return {
    deletedCount: deleteResult.deletedCount,
    chatId,
  };
};

export const updateDiagramCode = async (userId, diagramId, newCode) => {
  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new Error("Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new Error("Forbidden");
  }

  const updatedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    { $set: { diagramCode: newCode } },
    { new: true }
  );

  return updatedDiagram;
};

export const getAllUserDiagrams = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "diagramsGenerated",
    match: { isSaved: true },
    options: { sort: { updatedAt: -1 } },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.diagramsGenerated;
};

function convertDiagramDataToMermaid(diagramData) {
  switch (diagramData.diagramType) {
    case "Flowchart":
      return convertFlowchartDataToMermaid(diagramData);
    case "Sequence":
      return convertSequenceDiagramDataToMermaid(diagramData);
    case "ER":
      return convertERDiagramDataToMermaid(diagramData);
    case "Gantt":
      return convertGanttChartDataToMermaid(diagramData);
    default:
      return null;
  }
}

export const generateDiagramCodesPublic = async (prompt) => {
  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  if (!escapedPrompt) {
    throw new Error("Prompt text required");
  }

  const relevantTypes = await classifyPromptDiagramTypes(escapedPrompt);

  if (!relevantTypes || relevantTypes.length === 0) {
    return [];
  }

  const generationPromises = relevantTypes.map((type) =>
    generateDiagramData(escapedPrompt, type)
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedDiagramData = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  if (generatedDiagramData.length === 0) {
    throw new Error("AI failed to generate any diagrams");
  }

  const diagramCodes = generatedDiagramData
    .map((diagramData) => {
      if (!diagramData) return null;
      return convertDiagramDataToMermaid(diagramData);
    })
    .filter(Boolean);

  return diagramCodes;
};

