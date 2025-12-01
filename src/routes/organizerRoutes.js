import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import {
  applyOrganizer,
  getOrganizerStatus,
  organizerDashboardAnalytics,
} from "../controllers/organizerController.js";

const router = express.Router();

// User must be logged in
router.post("/apply", authenticate, applyOrganizer); // Apply to become organizer
router.get("/status", authenticate, getOrganizerStatus); // Check current user's organizer status

//organizer dashboard analytics
router.get(
  "/organizerDashboardAnalytics",
  authenticate,
  authorize("organizer"),
  organizerDashboardAnalytics
);
export default router;
