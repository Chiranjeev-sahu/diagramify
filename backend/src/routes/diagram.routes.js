import { Router } from "express";
import {
  deleteDiagram,
  generateDiagrams,
  getAllUserDiagrams,
  getDiagramById,
  repromptDiagram,
  saveDiagram,
  updateDiagramCode,
} from "../controllers/diagram.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const diagramRouter = Router();

// Apply auth middleware to all diagram routes
diagramRouter.use(verifyJWT);

// POST /api/diagrams/generate
diagramRouter.route("/generate").post(generateDiagrams);

// GET /api/diagrams - Fetch user's saved diagrams
diagramRouter.route("/").get(getAllUserDiagrams);

// GET /api/diagrams/:id - Fetch a specific diagram
diagramRouter.route("/:id").get(getDiagramById);

// DELETE /api/diagrams/:id - Delete a specific diagram
diagramRouter.route("/:id").delete(deleteDiagram);

// PATCH /api/diagrams/:id/save - Save a diagram (PATCH is more appropriate for partial updates like 'isSaved')
diagramRouter.route("/:id/save").patch(saveDiagram);

// PUT /api/diagrams/:id/reprompt - Conversational editing (replaces diagram with new version)
diagramRouter.route("/:id/reprompt").patch(repromptDiagram);

// PUT /api/diagrams/:id/code - Direct code editing (replaces code)
diagramRouter.route("/:id/code").put(updateDiagramCode);

export default diagramRouter;
