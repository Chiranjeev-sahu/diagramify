import { User } from "../models/user.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendAuthResponseWithTokens } from "../utils/auth.utils.js"; // Import the new utility

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field.trim() === "")) {
    throw new APIError(400, "All fields are required");
  }

  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new APIError(409, "User with email or username already exists");
  }
  const createdUser = await User.create({
    username,
    email,
    password,
  });
  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering the user");
  }
  const userResponse = {
    _id: createdUser._id,
    username: createdUser.username,
    email: createdUser.email,
    diagramsGenerated:
      createdUser.diagramsGenerated.length || "No diagrams generated yet", // Ensure diagramsGenerated is included if it exists or defaults to 0
    createdAt: createdUser.createdAt,
    updatedAt: createdUser.updatedAt,
  };
  return await sendAuthResponseWithTokens(
    res,
    userResponse,
    201,
    "User registered successfully and logged in",
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new APIError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new APIError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APIError(401, "Invalid user credentials");
  }

  const loggedInUser = await User.findById(user._id);

  const userResponse = {
    _id: loggedInUser._id,
    username: loggedInUser.username,
    email: loggedInUser.email,
    diagramsGenerated: loggedInUser.diagramsGenerated.length
      ? loggedInUser.diagramsGenerated
      : 0,
    createdAt: loggedInUser.createdAt,
    updatedAt: loggedInUser.updatedAt,
  };
  return await sendAuthResponseWithTokens(
    res,
    userResponse,
    200,
    "User logged In successfully",
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged Out"));
});

export { loginUser, logoutUser, registerUser };
