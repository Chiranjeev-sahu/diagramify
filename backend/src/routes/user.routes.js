import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many attempts, please try again later" },
});

const router = Router();

router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;
