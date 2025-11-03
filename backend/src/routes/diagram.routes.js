// /mnt/new_volume/Diagramify/backend/src/routes/diagram.routes.js

import { Router } from "express";
import {
  generateDiagrams, // Import the controller function
} from "../controllers/diagram.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const diagramRouter = Router();
diagramRouter.use(verifyJWT);
diagramRouter.route("/generate").post(generateDiagrams);

// diagramRouter.route("/").get(verifyJWT, getDiagrams); // GET /api/diagrams - Fetch user's diagrams
// diagramRouter.route("/:diagramId").get(verifyJWT, getDiagramById); // GET /api/diagrams/:diagramId - Fetch a specific diagram
// diagramRouter.route("/:diagramId/save").post(verifyJWT, saveDiagram); // POST /api/diagrams/:diagramId/save - Save a diagram
// diagramRouter.route("/:diagramId/reprompt").post(verifyJWT, repromptDiagram); // POST /api/diagrams/:diagramId/reprompt - Conversational editing
// diagramRouter.route("/:diagramId/code").put(verifyJWT, updateDiagramCode); // PUT /api/diagrams/:diagramId/code - Direct code editing

export default diagramRouter; // Export the renamed router
