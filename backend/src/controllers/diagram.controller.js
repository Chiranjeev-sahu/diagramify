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
  // Individual converters (for generateDiagrams)
  convertERDiagramDataToMermaid,
  convertFlowchartDataToMermaid,
  convertGanttChartDataToMermaid,
  convertSequenceDiagramDataToMermaid,
  // Dispatcher (for repromptDiagram)
  diagramDataToMermaidCode,
  // Parser (for updateDiagramCode)
  mermaidCodeToDiagramData,
} from "../utils/diagram.converter.js";

/**
 * 1. generateDiagrams (Initial Generation)
 * Route: POST /api/diagrams/generate
 * (This is your provided function)
 */
export const generateDiagrams = asyncHandler(async (req, res) => {
  console.log("generateDiagrams - START");
  const { prompt } = req.body;
  if (!prompt) {
    console.warn("generateDiagrams - ERROR: Prompt text required");
    throw new APIError(400, "Prompt text required");
  }
  const userId = req.user._id;
  console.log("generateDiagrams - User ID:", userId);

  let relevantTypes;
  try {
    relevantTypes = await classifyPromptDiagramTypes(prompt);
  } catch (error) {
    console.error(
      "generateDiagrams - ERROR: Failed to classify prompt:",
      error,
    );
    throw new APIError(500, "Failed to analyze prompt with AI.");
  }

  if (!relevantTypes || relevantTypes.length === 0) {
    console.warn("generateDiagrams - No relevant diagram types found.");
    return res.json(
      new APIResponse(
        200,
        [],
        "Prompt analyzed, but no relevant diagram types were found.",
      ),
    );
  }

  console.log("generateDiagrams - Classified relevant types:", relevantTypes);

  const generationPromises = relevantTypes.map((type) =>
    generateDiagramData(prompt, type),
  );

  console.log(
    "generateDiagrams - Calling generateDiagramData for relevant types...",
  );

  const results = await Promise.allSettled(generationPromises);

  const generatedDiagramData = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      generatedDiagramData.push(result.value);
    } else {
      console.error(
        `generateDiagrams - ERROR: Failed to generate ${relevantTypes[index]}:`,
        result.reason.message,
      );
    }
  });

  if (generatedDiagramData.length === 0) {
    console.error(
      "generateDiagrams - All relevant diagram generations failed.",
    );
    throw new APIError(500, "AI failed to generate any of the diagrams.");
  }

  console.log(
    "generateDiagrams - Successfully generated data:",
    generatedDiagramData,
  );

  // --- STEP 3: CONVERT AND SAVE (This logic is the same as v1) ---
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
            `generateDiagrams - WARNING: Unsupported diagram type: ${diagramData.diagramType}`,
          );
          return null;
      }
    } catch (error) {
      console.error(
        "generateDiagrams - ERROR: Failed to convert diagram data:",
        error,
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
        diagramIds,
      );
    } catch (error) {
      console.error(
        "generateDiagrams - ERROR: Failed to update user's diagramsGenerated:",
        error,
      );
    }
  } else {
    console.warn(
      "generateDiagrams - No diagrams were successfully created and saved.",
    );
  }

  console.log("generateDiagrams - END - Returning response");
  return res.json(
    new APIResponse(201, createdDiagrams, "Generation Successful"),
  );
});

// --- NEW CONTROLLERS ---

/**
 * 2. repromptDiagram (Conversational Editing)
 * Route: PUT /api/diagrams/:id/reprompt
 */
export const repromptDiagram = asyncHandler(async (req, res) => {
  const { newPrompt } = req.body;
  const parentDiagramId = req.params.id;
  const userId = req.user._id;

  if (!newPrompt) {
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

  // AI Call (Step 1 - Interpretation)
  const structured_instruction = await interpretPromptToInstruction(
    newPrompt,
    current_diagramData,
  );

  // AI Call (Step 2 - Manipulation)
  const new_diagramData = await manipulateDiagramData(
    current_diagramData,
    structured_instruction,
  );

  // Conversion Call (using the dispatcher)
  const new_diagramCode = diagramDataToMermaidCode(new_diagramData);

  // DB Call (Write New Version)
  const newDiagramVersion = await Diagram.create({
    userId: userId,
    promptText: newPrompt,
    parentDiagramId: parentDiagramId, // Links to the previous version
    diagramType: parentDiagram.diagramType, // It's the same type
    diagramData: new_diagramData,
    diagramCode: new_diagramCode,
    isSaved: parentDiagram.isSaved, // Inherits saved state
    version: current_version + 1,
  });

  // DB Call (Update User)
  await User.findByIdAndUpdate(userId, {
    $push: { diagramsGenerated: newDiagramVersion._id },
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, newDiagramVersion, "Diagram updated successfully"),
    );
});

/**
 * 3. saveDiagram (Saving a Diagram)
 * Route: PATCH /api/diagrams/:id/save
 */
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

  // Atomically update the diagram
  const savedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    {
      $set: {
        isSaved: true,
        title: title, // Add title to the diagram model
      },
    },
    { new: true }, // Return the updated document
  );

  return res
    .status(200)
    .json(new APIResponse(200, savedDiagram, "Diagram saved to 'My Diagrams'"));
});

/**
 * 4. updateDiagramCode (Advanced Code Editor)
 * Route: PUT /api/diagrams/:id/code
 */
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

  // Code-to-Data Sync (REAL IMPLEMENTATION)
  // This now calls the async AI parser
  const new_diagramData = await mermaidCodeToDiagramData(
    newDiagramCode,
    diagramToUpdate.diagramType,
  );

  // DB Call (Update)
  const updatedDiagram = await Diagram.findByIdAndUpdate(
    diagramId,
    {
      $set: {
        diagramCode: newDiagramCode,
        diagramData: new_diagramData, // Update data as well
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new APIResponse(200, updatedDiagram, "Diagram code updated"));
});

/**
 * 5. getAllUserDiagrams (Get "My Diagrams")
 * Route: GET /api/diagrams
 */
export const getAllUserDiagrams = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Option B (Populating User - As per your plan)
  const user = await User.findById(userId).populate({
    path: "diagramsGenerated",
    match: { isSaved: true }, // Only populate diagrams where isSaved is true
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

/**
 * 6. getDiagramById (Get One Diagram)
 * Route: GET /api/diagrams/:id
 */
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

/**
 * 7. deleteDiagram (Delete a Diagram)
 * Route: DELETE /api/diagrams/:id
 */
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

  // DB Call (Delete)
  await Diagram.findByIdAndDelete(diagramId);

  // DB Call (Update User)
  await User.findByIdAndUpdate(userId, {
    $pull: { diagramsGenerated: diagramId },
  });

  return res
    .status(200)
    .json(new APIResponse(200, {}, "Diagram deleted successfully"));
});
