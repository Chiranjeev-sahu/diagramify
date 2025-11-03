import { Diagram } from "../models/diagram.model.js";
import { User } from "../models/user.model.js";
import {
  classifyPromptDiagramTypes,
  generateDiagramData,
} from "../utils/ai.utils.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  convertERDiagramDataToMermaid,
  convertFlowchartDataToMermaid,
  convertGanttChartDataToMermaid,
  convertSequenceDiagramDataToMermaid,
} from "../utils/diagram.converter.js";

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

  // If *all* of them failed (e.g., 2 were relevant, 2 failed),
  // then we should tell the user.
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
