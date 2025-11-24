import express from "express";
import {
  createEvent,
  getMyEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
} from "../../controllers/organizer/organizerEventController.js";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";
const router = express.Router();

//organizer create event
router.post("/createEvent", authenticate, authorize("organizer"), createEvent);

//organizer get his all events
router.get("/getMyEvents", authenticate, authorize("organizer"), getMyEvents);

//organizer get his own single event by eventid
router.get("/getSingleEvent/:eventId", authenticate, getSingleEvent);

//organizer update event
router.patch(
  "/updateEvent/:eventId",
  authenticate,
  authorize("organizer"),
  updateEvent
);

//organizer delete event
router.delete(
  "/deleteEvent/:eventId",
  authenticate,
  authorize("organizer"),
  deleteEvent
);

export default router;
