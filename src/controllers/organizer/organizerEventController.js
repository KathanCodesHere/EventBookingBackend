import Event from "../../models/Event.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../../utils/responseHandler.js";
import {
  validateRequired,
  validateObjectId,
} from "../../validation/validation.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, price, location } = req.body;

    const { isValid, errors } = validateRequired({
      title,
      date,
      price,
      location,
    });
    if (!isValid) return sendValidationError(res, errors);

    const event = await Event.create({
      organizerId: req.user._id,
      title,
      description,
      date,
      price,
      location,
    });

    return sendSuccess(res, event, "Event created successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Get all events of organizer
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id });
    return sendSuccess(res, events, "Events fetched");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Get single event
export const getSingleEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid Event ID" },
      ]);

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user._id,
    });
    if (!event) return sendNotFound(res, "Event not found");

    return sendSuccess(res, event, "Event fetched");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid Event ID" },
      ]);

    const event = await Event.findOneAndUpdate(
      { _id: eventId, organizerId: req.user._id },
      req.body,
      { new: true }
    );

    if (!event) return sendNotFound(res, "Event not found");

    return sendSuccess(res, event, "Event updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Delete event (soft delete)
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid event ID" },
      ]);

    const event = await Event.findOne({
      _id: eventId,
      organizerId: req.user._id,
    });
    if (!event) return sendNotFound(res, "Event not found or unauthorized");

    await Event.findByIdAndDelete(eventId);

    return sendSuccess(res, null, "Event deleted successfully");
  } catch (error) {
    console.log(error);
    return sendError(res, "Something went wrong while deleting event");
  }
};
