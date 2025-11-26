import { Router } from "express";
import {
  getChatHistory,
  deleteChat,
} from "../controllers/chat.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const chatRouter = Router();

chatRouter.use(verifyJWT);

chatRouter.route("/:chatId").get(getChatHistory);

chatRouter.route("/:chatId").delete(deleteChat);

export default chatRouter;
