import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

import {
  inviteTicketChecker,
  assignEventToTicketChecker,
  getAssignedEvents,
  getTicketsForChecker,
  getEventStatsForChecker,
  searchTicketForChecker,
} from "../controllers/ticketCheckerController.js";
const router = express.Router();

/**=========================ORGANIZER-TICKETCHECKER-API-ROUTES=================================== */
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

/**=================================TICKETCHECKER-ROUTES======================================== */
//get assigned Events
router.get(
  "/getAssignedEvents",
  authenticate,
  authorize("ticketChecker"),
  getAssignedEvents
);

//get assignedEvents's tickets -booked/cancelled/refunded
router.get(
  "/getTicketsForChecker/:eventId",
  authenticate,
  authorize("ticketChecker"),
  getTicketsForChecker
);

//Ticket Checker ka Live Event Check-in Dashboard
router.get(
  "/getEventStatsForChecker/:eventId",
  authenticate,
  authorize("ticketChecker"),
  getEventStatsForChecker
);

//search tickets
router.get(
  "/searchTicketForChecker/:eventId",
  authenticate,
  authorize("ticketChecker"),
  searchTicketForChecker
);

export default router;
