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

diagramRouter.use(verifyJWT);
//to generate new
diagramRouter.route("/generate").post(generateDiagrams);

//to fetch user's saved diagrams
diagramRouter.route("/").get(getAllUserDiagrams);

// to fetch a specific diagram
diagramRouter.route("/:id").get(getDiagramById);

// to delete a specific diagram
diagramRouter.route("/:id").delete(deleteDiagram);

//to save a diagram
diagramRouter.route("/:id/save").patch(saveDiagram);

// for conversational editing (replaces diagram with new version)
diagramRouter.route("/:id/reprompt").patch(repromptDiagram);

// for direct code editing (replaces code)
diagramRouter.route("/:id/code").put(updateDiagramCode);

export default diagramRouter;
