import express from "express";
import {
  verifyTicket,
  checkinTicket,
} from "../controllers/scannerController.js";

import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

//verify ticket
router.get(
  "/verifyTicket/:ticketId",
  authenticate,
  authorize("admin", "organizer", "ticketChecker"),
  verifyTicket
);

//Check-in API (atomic, prevents race conditions)
router.post(
  "/checkin/:ticketId",
  authenticate,
  authorize("admin", "organizer", "ticketChecker"),
  checkinTicket
);

export default router;
