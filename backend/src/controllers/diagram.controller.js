import { Diagram } from "../models/diagram.model.js";
import { User } from "../models/user.model.js";
import {
  classifyPromptDiagramTypes,
  generateDiagramData,
  interpretPromptToInstruction,
  manipulateDiagramData,
} from "../utils/ai.utils.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  // converters for generateDiagrams
  convertERDiagramDataToMermaid,
  convertFlowchartDataToMermaid,
  convertGanttChartDataToMermaid,
  convertSequenceDiagramDataToMermaid,
  diagramDataToMermaidCode,
  mermaidCodeToDiagramData,
} from "../utils/diagram.converter.js";

export const generateDiagrams = asyncHandler(async (req, res) => {
  console.log("generateDiagrams - START");
  const { prompt } = req.body;
  if (!prompt) {
    console.warn("generateDiagrams - ERROR: Prompt text required");
    throw new APIError(400, "Prompt text required");
  }

  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  if (!escapedPrompt) {
    console.warn("generateDiagrams - ERROR: Prompt text required");
    throw new APIError(400, "Prompt text required");
  }
  const userId = req.user._id;

  let relevantTypes;
  try {
    relevantTypes = await classifyPromptDiagramTypes(escapedPrompt);
  } catch (error) {
    console.error(
      "generateDiagrams - ERROR: Failed to classify prompt:",
      error
    );
    throw new APIError(500, "Failed to analyze prompt with AI.");
  }

  if (!relevantTypes || relevantTypes.length === 0) {
    console.warn("generateDiagrams - No relevant diagram types found.");
    return res.json(
      new APIResponse(
        200,
        [],
        "Prompt analyzed, but no relevant diagram types were found."
      )
    );
  }

  const generationPromises = relevantTypes.map((type) =>
    generateDiagramData(escapedPrompt, type)
  );

  console.log(
    "generateDiagrams - Calling generateDiagramData for relevant types..."
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedDiagramData = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      generatedDiagramData.push(result.value);
    } else {
      console.error(
        `generateDiagrams - ERROR: Failed to generate ${relevantTypes[index]}:`,
        result.reason.message
      );
    }
  });

  if (generatedDiagramData.length === 0) {
    console.error(
      "generateDiagrams - All relevant diagram generations failed."
    );
    throw new APIError(500, "AI failed to generate any of the diagrams.");
  }

  console.log(
    "generateDiagrams - Successfully generated data:",
    generatedDiagramData
  );

  const saveDiagrams = generatedDiagramData.map(async (diagramData) => {
    if (!diagramData) {
      console.warn("generateDiagrams - Skipping null diagram data.");
      return null;
    }

    let diagramCode = "";
    try {
      switch (diagramData.diagramType) {
        case "Flowchart":
          diagramCode = convertFlowchartDataToMermaid(diagramData);
          break;
        case "Sequence":
          diagramCode = convertSequenceDiagramDataToMermaid(diagramData);
          break;
        case "ER":
          diagramCode = convertERDiagramDataToMermaid(diagramData);
          break;
        case "Gantt":
          diagramCode = convertGanttChartDataToMermaid(diagramData);
          break;
        default:
          console.warn(
            `generateDiagrams - WARNING: Unsupported diagram type: ${diagramData.diagramType}`
          );
          return null;
      }
    } catch (error) {
      console.error(
        "generateDiagrams - ERROR: Failed to convert diagram data:",
        error
      );
      return null;
    }

    if (!diagramCode) {
      console.warn("generateDiagrams - Skipping save due to empty diagramCode");
      return null;
    }

    let newDiagram;
    try {
      newDiagram = await Diagram.create({
        userId: userId,
        promptText: prompt,
        parentDiagramId: null,
        diagramType: diagramData.diagramType,
        diagramData: diagramData,
        diagramCode: diagramCode,
        isSaved: false,
        version: 1,
      });
    } catch (error) {
      console.error("generateDiagrams - ERROR: Failed to save diagram:", error);
      return null;
    }
    return newDiagram;
  });

  const createdDiagrams = (await Promise.all(saveDiagrams)).filter(Boolean);
  const diagramIds = createdDiagrams.map((doc) => doc._id);

  if (diagramIds.length > 0) {
    try {
      await User.findByIdAndUpdate(userId, {
        $push: {
          diagramsGenerated: {
            $each: diagramIds,
          },
        },
      });
      console.log(
        "generateDiagrams - Updated user's generated diagrams:",
        diagramIds
      );
    } catch (error) {
      console.error(
        "generateDiagrams - ERROR: Failed to update user's diagramsGenerated:",
        error
      );
    }
  } else {
    console.warn(
      "generateDiagrams - No diagrams were successfully created and saved."
    );
  }

  console.log("generateDiagrams - END - Returning response");
  return res.json(
    new APIResponse(201, createdDiagrams, "Generation Successful")
  );
});

//for free trial diagram generation
const freeTrialUsage = {};
export const generateDiagramsPublic = asyncHandler(async (req, res) => {
  console.log("generateDiagramsPublic - START");
  const ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
  if (!ipAddress) {
    console.warn(
      "generateDiagramsPublic - ERROR: Could not determine IP address"
    );
    return res.status(500)
              .json(new APIResponse(500, {}, "Could not determine IP address"));
  }

  if (freeTrialUsage[ipAddress] && freeTrialUsage[ipAddress] >= 3) {
    console.warn(
      `generateDiagramsPublic - ERROR: IP ${ipAddress} exceeded free trial limit`
    );
    return res
      .status(429)
      .json(new APIResponse(429, {}, "Free trial limit exceeded")); // 429 Too Many Requests
  }

  freeTrialUsage[ipAddress] = (freeTrialUsage[ipAddress] || 0) + 1;


  const { prompt } = req.body;
  if (!prompt) {
    console.warn("generateDiagrams - ERROR: Prompt text required");
    throw new APIError(400, "Prompt text required");
  }

  const escapedPrompt = prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  if (!escapedPrompt) {
    console.warn("generateDiagrams - ERROR: Prompt text required");
    throw new APIError(400, "Prompt text required");
  }

  let relevantTypes;
  try {
    relevantTypes = await classifyPromptDiagramTypes(escapedPrompt);
  } catch (error) {
    console.error(
      "generateDiagrams - ERROR: Failed to classify prompt:",
      error
    );
    throw new APIError(500, "Failed to analyze prompt with AI.");
  }

  if (!relevantTypes || relevantTypes.length === 0) {
    console.warn("generateDiagrams - No relevant diagram types found.");
    return res.json(
      new APIResponse(
        200,
        [],
        "Prompt analyzed, but no relevant diagram types were found."
      )
    );
  }

  const generationPromises = relevantTypes.map((type) =>
    generateDiagramData(escapedPrompt, type)
  );

  console.log(
    "generateDiagrams - Calling generateDiagramData for relevant types..."
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedDiagramData = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      generatedDiagramData.push(result.value);
    } else {
      console.error(
        `generateDiagrams - ERROR: Failed to generate ${relevantTypes[index]}:`,
        result.reason.message
      );
    }
  });

  if (generatedDiagramData.length === 0) {
    console.error(
      "generateDiagrams - All relevant diagram generations failed."
    );
    throw new APIError(500, "AI failed to generate any of the diagrams.");
  }

  console.log(
    "generateDiagrams - Successfully generated data:",
    generatedDiagramData
  );
  const diagramCodes = await Promise.all(
    generatedDiagramData.map(async (diagramData) => {
      if (!diagramData) {
        console.warn("generateDiagrams - Skipping null diagram data.");
        return null;
      }

      let diagramCode = "";
      try {
        switch (diagramData.diagramType) {
          case "Flowchart":
            diagramCode = convertFlowchartDataToMermaid(diagramData);
            break;
          case "Sequence":
            diagramCode = convertSequenceDiagramDataToMermaid(diagramData);
            break;
          case "ER":
            diagramCode = convertERDiagramDataToMermaid(diagramData);
            break;
          case "Gantt":
            diagramCode = convertGanttChartDataToMermaid(diagramData);
            break;
          default:
            console.warn(
              `generateDiagrams - WARNING: Unsupported diagram type: ${diagramData.diagramType}`
            );
            return null;
        }
      } catch (error) {
        console.error(
          "generateDiagrams - ERROR: Failed to convert diagram data:",
          error
        );
        return null;
      }

      if (!diagramCode) {
        console.warn(
          "generateDiagrams - Skipping save due to empty diagramCode"
        );
        return null;
      }
      return diagramCode;
    })
  );

  const createdDiagrams = diagramCodes.filter(Boolean);

  if (createdDiagrams.length === 0) {
    console.warn(
      "generateDiagrams - No diagrams were successfully created and saved."
    );
    return res
      .status(200)
      .json(
        new APIResponse(
          200,
          [],
          "The AI could not generate a diagram from the provided prompt. Please try a different prompt or diagram type."
        )
      );
  }

  console.log("generateDiagrams - END");
  return res
    .status(200)
    .json(
      new APIResponse(200, createdDiagrams, "Diagrams generated successfully")
    );
});

export const repromptDiagram = asyncHandler(async (req, res) => {
  const { newPrompt } = req.body;
  const parentDiagramId = req.params.id;
  const userId = req.user._id;
  const escapedNewPrompt = newPrompt.prompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
  if (!escapedNewPrompt) {
    throw new APIError(400, "Re-prompt text is required");
  }

  const parentDiagram = await Diagram.findById(parentDiagramId);
  if (!parentDiagram) {
    throw new APIError(404, "Original diagram not found");
  }

  if (parentDiagram.userId.toString() !== userId.toString()) {
    throw new APIError(403, "You are not authorized to edit this diagram");
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

  const newDiagramVersion = await Diagram.create({
    userId: userId,
    promptText: newPrompt,
    parentDiagramId: parentDiagramId,
    diagramType: parentDiagram.diagramType,
    diagramData: new_diagramData,
    diagramCode: new_diagramCode,
    isSaved: parentDiagram.isSaved,
    version: current_version + 1,
  });

  await User.findByIdAndUpdate(userId, {
    $push: { diagramsGenerated: newDiagramVersion._id },
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, newDiagramVersion, "Diagram updated successfully")
    );
});

export const saveDiagram = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const diagramId = req.params.id;
  const userId = req.user._id;
  if (!title) {
    throw new APIError(400, "A title is required to save the diagram");
  }

  const diagramToSave = await Diagram.findById(diagramId);
  if (!diagramToSave) {
    throw new APIError(404, "Diagram not found");
  }

  if (diagramToSave.userId.toString() !== userId.toString()) {
    throw new APIError(403, "Forbidden");
  }

  const savedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    {
      $set: {
        isSaved: true,
        title: title,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new APIResponse(200, savedDiagram, "Diagram saved to 'My Diagrams'"));
});

export const updateDiagramCode = asyncHandler(async (req, res) => {
  const { newDiagramCode } = req.body;
  const diagramId = req.params.id;
  const userId = req.user._id;

  if (!newDiagramCode) {
    throw new APIError(400, "Diagram code cannot be empty");
  }

  const diagramToUpdate = await Diagram.findById(diagramId);
  if (!diagramToUpdate) {
    throw new APIError(404, "Diagram not found");
  }

  if (diagramToUpdate.userId.toString() !== userId.toString()) {
    throw new APIError(403, "Forbidden");
  }

  const new_diagramData = await mermaidCodeToDiagramData(
    newDiagramCode,
    diagramToUpdate.diagramType
  );

  const updatedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    {
      $set: {
        diagramCode: newDiagramCode,
        diagramData: new_diagramData,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new APIResponse(200, updatedDiagram, "Diagram code updated"));
});

export const getAllUserDiagrams = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: "diagramsGenerated",
    match: { isSaved: true },
    options: { sort: { updatedAt: -1 } },
  });

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const savedDiagrams = user.diagramsGenerated;

  return res
    .status(200)
    .json(new APIResponse(200, savedDiagrams, "Retrieved saved diagrams"));
});

export const getDiagramById = asyncHandler(async (req, res) => {
  const diagramId = req.params.id;
  const userId = req.user._id;

  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new APIError(404, "Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new APIError(403, "You are not authorized to view this diagram");
  }

  return res
    .status(200)
    .json(new APIResponse(200, diagram, "Diagram retrieved"));
});

export const deleteDiagram = asyncHandler(async (req, res) => {
  const diagramId = req.params.id;
  const userId = req.user._id;

  const diagram = await Diagram.findById(diagramId);

  if (!diagram) {
    throw new APIError(404, "Diagram not found");
  }

  if (diagram.userId.toString() !== userId.toString()) {
    throw new APIError(403, "Forbidden");
  }

  await Diagram.findByIdAndDelete(diagramId);

  await User.findByIdAndUpdate(userId, {
    $pull: { diagramsGenerated: diagramId },
  });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Diagram deleted successfully"));
});
