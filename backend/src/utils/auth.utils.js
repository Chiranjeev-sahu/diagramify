//this is for token related tasks-generation and response creation to abstract out the loginUser and registerUser controller
import { User } from "../models/user.model.js";
import { APIError } from "./apiError.js";
import { APIResponse } from "./apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error);
    throw new APIError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const sendAuthResponseWithTokens = async (res, user, statusCode, message) => {
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(
        statusCode,
        {
          user: user,
          accessToken,
          refreshToken,
        },
        message,
      ),
    );
};

export { generateAccessAndRefreshToken, sendAuthResponseWithTokens };
