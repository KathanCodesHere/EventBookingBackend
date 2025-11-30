import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

import {
  inviteTicketChecker,
  assignEventToTicketChecker,
  getAssignedEvents,
} from "../controllers/ticketCheckerController.js";
const router = express.Router();

//organizer invite ticket checkar
router.post(
  "/inviteTicketChecker",
  authenticate,
  authorize("organizer"),
  inviteTicketChecker
);

//assign event to checker
router.post(
  "/assignEvent",
  authenticate,
  authorize("organizer"),
  assignEventToTicketChecker
);

//get assigned Events
router.get(
  "/getAssignedEvents",
  authenticate,
  authorize("ticketChecker"),
  getAssignedEvents
);
export default router;
