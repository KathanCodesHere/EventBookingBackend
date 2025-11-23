import express from "express";
import {
  signup,
  login,
  refreshToken,
  getProfile,
  logout,
} from "../controllers/authController.js";

import { authenticate, authorize } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.get(
  "/get-profile",
  authenticate,
  authorize("admin", "user", "organizer", "ticketChecker"),
  getProfile
);

router.get("/logout", logout);

export default router;
