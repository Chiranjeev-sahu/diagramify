import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import * as diagramService from "../services/diagram.service.js";

export const generateDiagrams = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    throw new APIError(400, "Prompt text required");
  }

  const userId = req.user._id;
  const createdDiagrams = await diagramService.createDiagramFromPrompt(userId, prompt);

  return res.json(
    new APIResponse(201, createdDiagrams, "Generation Successful")
  );
});

export const repromptDiagram = asyncHandler(async (req, res) => {
  const { newPrompt } = req.body;
  const parentDiagramId = req.params.id;
  const userId = req.user._id;

  const newDiagramVersion = await diagramService.createNewDiagramVersion(
    userId,
    parentDiagramId,
    newPrompt
  );

  return res
    .status(200)
    .json(
      new APIResponse(200, newDiagramVersion, "Diagram updated successfully")
    );
});

export const getLatestVersions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const latestVersions = await diagramService.getLatestDiagramVersions(userId);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        latestVersions,
        "Retrieved latest diagram versions for sidebar"
      )
    );
});

export const getDiagramById = asyncHandler(async (req, res) => {
  const diagramId = req.params.id;
  const userId = req.user._id;

  const diagram = await diagramService.getDiagramById(userId, diagramId);

  return res
    .status(200)
    .json(new APIResponse(200, diagram, "Diagram retrieved"));
});

export const deleteDiagram = asyncHandler(async (req, res) => {
  const diagramId = req.params.id;
  const userId = req.user._id;

  const result = await diagramService.deleteDiagramFamily(userId, diagramId);

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        result,
        `Deleted ${result.deletedCount} diagram version(s) successfully`
      )
    );
});

export const updateDiagramCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const diagramId = req.params.id;
  const userId = req.user._id;

  if (!code) {
    throw new APIError(400, "Code is required");
  }

  const updatedDiagram = await diagramService.updateDiagramCode(
    userId,
    diagramId,
    code
  );

  return res
    .status(200)
    .json(new APIResponse(200, updatedDiagram, "Diagram code updated"));
});

const freeTrialUsage = {};

export const generateDiagramsPublic = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  if (!ipAddress) {
    return res.status(500).json(
      new APIResponse(500, {}, "Could not determine IP address")
    );
  }

  if (freeTrialUsage[ipAddress] && freeTrialUsage[ipAddress] >= 3) {
    return res.status(429).json(
      new APIResponse(429, {}, "Free trial limit exceeded")
    );
  }

  freeTrialUsage[ipAddress] = (freeTrialUsage[ipAddress] || 0) + 1;

  const { prompt } = req.body;
  
  if (!prompt) {
    throw new APIError(400, "Prompt text required");
  }

  const diagramCodes = await diagramService.generateDiagramCodesPublic(prompt);

  if (diagramCodes.length === 0) {
    return res.status(200).json(
      new APIResponse(
        200,
        [],
        "The AI could not generate a diagram from the provided prompt"
      )
    );
  }

  return res.status(200).json(
    new APIResponse(200, diagramCodes, "Diagrams generated successfully")
  );
});

