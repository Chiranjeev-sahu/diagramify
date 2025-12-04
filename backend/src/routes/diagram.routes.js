import { Router } from "express";
import {
  deleteDiagram,
  generateDiagrams,
  getLatestVersions,
  getDiagramById,
  repromptDiagram,
  updateDiagramCode,
} from "../controllers/diagram.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const diagramRouter = Router();

diagramRouter.use(verifyJWT);
//to generate new
diagramRouter.route("/generate").post(generateDiagrams);

//to fetch latest versions for sidebar
diagramRouter.route("/latest").get(getLatestVersions);

// to fetch a specific diagram
diagramRouter.route("/:id").get(getDiagramById);

// to delete a specific diagram (deletes all versions with same chatId)
diagramRouter.route("/:id").delete(deleteDiagram);

// for conversational editing (replaces diagram with new version)
diagramRouter.route("/:id/reprompt").patch(repromptDiagram);

// for direct code editing (replaces code)
diagramRouter.route("/:id/code").put(updateDiagramCode);

export default diagramRouter;
