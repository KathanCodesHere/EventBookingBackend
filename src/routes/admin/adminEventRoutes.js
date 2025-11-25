import express from "express";

import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEventsAdmin,
} from "../../controllers/admin/adminEventController.js";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";

const router = express.Router();

//get pending event request
router.get(
  "/events/getPendingEvents",
  authenticate,
  authorize("admin"),
  getPendingEvents
);

//update event request=approve
router.patch(
  "/events/approve/:eventId",
  authenticate,
  authorize("admin"),
  approveEvent
);

//update event request=reject
router.patch(
  "/events/reject/:eventId",
  authenticate,
  authorize("admin"),
  rejectEvent
);

//get all events
router.get(
  "/events/getAllEventsAdmin",
  authenticate,
  authorize("admin"),
  getAllEventsAdmin
);

export default router;
