import { Chat } from "../models/chat.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findOne({ chatId, userId });

  if (!chat) {
    throw new APIError(404, "Chat not found");
  }

  return res.json(
    new APIResponse(200, chat, "Chat history retrieved successfully")
  );
});


export const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  const deletedChat = await Chat.findOneAndDelete({ chatId, userId });

  if (!deletedChat) {
    throw new APIError(404, "Chat not found");
  }

  return res.json(
    new APIResponse(200, { chatId }, "Chat deleted successfully")
  );
});
