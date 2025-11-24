import express from "express";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";

import {
  getPendingOrganizerRequests,
  getOrganizerRequestById,
  updateOrganizerStatus,
} from "../../controllers/admin/adminOrganizerController.js";
const router = express.Router();

//get pending request
router.get(
  "/organizer/pending",
  authenticate,
  authorize("admin"),
  getPendingOrganizerRequests
);
//get pending request by id
router.get(
  "/organizer/request/:id",
  authenticate,
  authorize("admin"),
  getOrganizerRequestById
);

//update organizer request status
router.patch(
  "/organizer/updateStatus/:id",
  authenticate,
  authorize("admin"),
  updateOrganizerStatus
);

export default router;
