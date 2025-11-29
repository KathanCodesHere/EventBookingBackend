import Event from "../../models/Event.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../../utils/responseHandler.js";
import { validateObjectId } from "../../validation/validation.js";

//get pending events
export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).populate(
      "organizerId",
      "username email"
    );

    return sendSuccess(res, events, "Pending events fetched");
  } catch (err) {
    console.error("Get pending Event request error", err);
    return sendError(res, "Error fetching pending events");
  }
};

//approve event only admin
export const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid Event ID" },
      ]);

    const event = await Event.findById(eventId);
    if (!event) return sendNotFound(res, "Event not found");

    event.status = "active"; // approved & visible publicly
    await event.save();

    return sendSuccess(res, event, "Event approved successfully");
  } catch (err) {
    console.error("Approve event error", err);
    return sendError(res, "Error approving event");
  }
};

//reject event
export const rejectEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid Event ID" },
      ]);

    const event = await Event.findById(eventId);
    if (!event) return sendNotFound(res, "Event not found");

    event.status = "rejected";
    await event.save();

    return sendSuccess(res, event, "Event rejected successfully");
  } catch (err) {
    console.error("Reject event error:", err);
    return sendError(res, "Error rejecting event");
  }
};

//get all events for admin
export const getAllEventsAdmin = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("organizerId", "username email role")
      .sort({ createdAt: -1 });

    return sendSuccess(res, events, "All events fetched for admin");
  } catch (err) {
    console.error("Get all evets for admin error:", err);
    return sendError(res, "Error fetching events");
  }
};
