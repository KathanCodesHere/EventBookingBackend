import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  applyOrganizer,
  getOrganizerStatus,
} from "../controllers/organizerController.js";

const router = express.Router();

// User must be logged in
router.post("/apply", authenticate, applyOrganizer); // Apply to become organizer
router.get("/status", authenticate, getOrganizerStatus); // Check current user's organizer status

export default router;
