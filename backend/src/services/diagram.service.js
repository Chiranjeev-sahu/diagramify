import crypto from "crypto";
import { Diagram } from "../models/diagram.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { classifyPromptDiagramTypes } from "./ai/classifier.js";
import { generateDiagramData } from "./ai/generator.js";
import { diagramDataToMermaidCode, mermaidCodeToDiagramData } from "../utils/diagram.converter.js";
import { interpretPromptToInstruction, manipulateDiagramData } from "./ai/manipulator.js";
import { APIError } from "../utils/apiError.js";
export const createDiagramFromPrompt = async (userId, prompt) => {
  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  if (!escapedPrompt) {
    throw new APIError(400,"Prompt text required");
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
    throw new APIError(503,"AI failed to generate any diagrams");
  }

  const saveDiagrams = generatedDiagramData.map(async (diagramData) => {
    if (!diagramData) return null;

    const diagramCode = diagramDataToMermaidCode(diagramData);
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
    throw new APIError(400,"Re-prompt text is required");
  }

  const parentDiagram = await Diagram.findById(parentDiagramId);
  if (!parentDiagram) {
    throw new APIError(404,"Original diagram not found");
  }

  if (parentDiagram.userId.toString() !== userId.toString()) {
    throw new APIError(403,"You are not authorized to edit this diagram");
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
    throw new APIError(404,"Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new APIError(403,"You are not authorized to view this diagram");
  }

  return diagram;
};

export const deleteDiagramFamily = async (userId, diagramId) => {
  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new APIError(404,"Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new APIError(403,"Forbidden");
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
    throw new APIError(404,"Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new APIError(403,"Forbidden");
  }

  const newDiagramData = await mermaidCodeToDiagramData(newCode, diagram.diagramType);

  const updateFields = { diagramCode: newCode };
  if (newDiagramData && !newDiagramData.error) {
    updateFields.diagramData = newDiagramData;
  }

  const updatedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    { $set: updateFields },
    { new: true }
  );

  return updatedDiagram;
};

export const generateDiagramCodesPublic = async (prompt) => {
  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  if (!escapedPrompt) {
    throw new APIError(400,"Prompt text required");
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
    throw new APIError(503,"AI failed to generate any diagrams");
  }

  const diagramCodes = generatedDiagramData
    .map((diagramData) => {
      if (!diagramData) return null;
      return diagramDataToMermaidCode(diagramData);
    })
    .filter(Boolean);

  return diagramCodes;
};

