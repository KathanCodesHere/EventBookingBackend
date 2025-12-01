import mongoose from "mongoose";
import User from "../models/user.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import { sendEmail } from "../utils/emailUtils.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendConflict,
  sendForbidden,
} from "../utils/responseHandler.js";

import {
  validateEmail,
  validateMobile,
  validateUsername,
  validatePassword,
  validateRole,
  sanitizeObject,
  sanitizeInput,
  validateRequired,
} from "../validation/validation.js";

import bcrypt from "bcryptjs";
//invite ticket checker
// Invite Ticket Checker (Organizer creates temporary account)
export const inviteTicketChecker = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { username, email, mobile } = req.body;

    // Sanitize input
    const sanitizedMobile = sanitizeInput(String(mobile));
    const sanitizedData = sanitizeObject({ username, email });

    const errors = [];

    // Validate Mobile
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.isValid) {
      return sendValidationError(res, [mobileValidation.message]);
    }

    // Validate Username
    if (sanitizedData.username) {
      const usernameValidation = validateUsername(sanitizedData.username);
      if (!usernameValidation.isValid) errors.push(usernameValidation.message);
    }

    // Validate Email
    if (sanitizedData.email) {
      const emailValidation = validateEmail(sanitizedData.email);
      if (!emailValidation.isValid) errors.push(emailValidation.message);
    }

    if (errors.length > 0)
      return sendValidationError(res, errors, "Validation failed");

    // Check if email already exists
    const existing = await User.findOne({ email: sanitizedData.email });
    if (existing) {
      return sendError(res, "This email is already registered", 400);
    }

    const existingMobile = await User.findOne({
      mobile: sanitizedMobile,
    });

    if (existingMobile) {
      return sendError(res, "This mobile number is already registered", 400);
    }

    // Temp password (hashed)
    const hashedPassword = await bcrypt.hash(
      "Temp@1234",
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Create Ticket Checker (Pending)
    const newChecker = await User.create({
      username: sanitizedData.username,
      email: sanitizedData.email,
      mobile: sanitizedMobile,
      password: hashedPassword,
      role: "ticketChecker",
      isVerified: false,
      ticketCheckerInfo: {
        assignedByOrganizer: organizerId,
        assignedEvents: [],
        status: "pending",
      },
    });
    //send mail to user
    await sendEmail({
      to: newChecker.email,
      subject: "Ticket Checker Invitation",
      html: `
    <p>Hello <strong>${newChecker.username}</strong>,</p>

    <p>You have been invited as a <strong>Ticket Checker</strong>.</p>

    <p><strong>Your login details:</strong></p>
    <p>Mobile: ${newChecker.mobile}</p>
    <p>Password: Temp@1234</p>

    <p>Please login using the above credentials and reset your password.</p>

    <p>Login here: <a href="https://your-frontend-domain.com/login">Login Now</a></p>

    <br/>
    <p>Thank You,<br/>Team Event Management</p>
  `,
    });

    // Prepare response (no password)
    const responseData = {
      _id: newChecker._id,
      username: newChecker.username,
      email: newChecker.email,
      mobile: newChecker.mobile,
      role: newChecker.role,
      status: newChecker.ticketCheckerInfo.status,
      isActive: newChecker.isActive,
      isVerified: newChecker.isVerified,
      createdAt: newChecker.createdAt,
    };

    return sendSuccess(res, responseData, "Ticket Checker invited");
  } catch (error) {
    console.log("Invite Ticket Checker Error:", error);
    return sendError(res, "Error inviting ticket checker");
  }
};

//assign event to ticket checker
export const assignEventToTicketChecker = async (req, res) => {
  try {
    const { checkerId, eventId } = req.body;

    const checker = await User.findById(checkerId);

    if (!checker || checker.role !== "ticketChecker") {
      return sendNotFound(res, "Ticket Checker not found");
    }

    // Initialize array if undefined
    checker.ticketCheckerInfo.assignedEvents =
      checker.ticketCheckerInfo.assignedEvents || [];

    // Avoid duplicate assignment
    if (!checker.ticketCheckerInfo.assignedEvents.includes(eventId)) {
      checker.ticketCheckerInfo.assignedEvents.push(eventId);
      await checker.save();
    }

    // Populate assigned events with title & description
    await checker.populate({
      path: "ticketCheckerInfo.assignedEvents",
      select: "title description _id", // only needed fields
    });

    // Send only necessary data
    const responseData = {
      _id: checker._id,
      username: checker.username,
      email: checker.email,
      mobile: checker.mobile,
      role: checker.role,
      assignedEvents: checker.ticketCheckerInfo.assignedEvents,
    };

    return sendSuccess(res, responseData, "Event assigned");
  } catch (error) {
    console.log("Assign Event Error", error);
    return sendError(res, "Error assigning event");
  }
};

//view assigned evetns
export const getAssignedEvents = async (req, res) => {
  try {
    // Find the checker and populate assigned events inside ticketCheckerInfo
    const checker = await User.findById(req.user._id).populate({
      path: "ticketCheckerInfo.assignedEvents",
      select: "title description _id", // only return necessary fields
    });

    if (!checker || !checker.ticketCheckerInfo) {
      return sendNotFound(res, "Ticket checker info not found");
    }

    // Return assigned events safely
    const assignedEvents = checker.ticketCheckerInfo.assignedEvents || [];

    return sendSuccess(res, assignedEvents, "Assigned events");
  } catch (error) {
    console.error("Get assigned events error", error);
    return sendError(res, "Failed to fetch assigned events");
  }
};

// Get tickets for a ticket checker for a specific event with pagination & status filter
export const getTicketsForChecker = async (req, res) => {
  try {
    const checkerId = req.user._id;
    const { eventId } = req.params;

    // Pagination query params
    let { page = 1, limit = 20, status } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch the checker
    const checker = await User.findById(checkerId);

    if (!checker || checker.role !== "ticketChecker") {
      return sendNotFound(res, "Ticket Checker not found");
    }

    const assignedEvents = checker.ticketCheckerInfo?.assignedEvents || [];

    if (!assignedEvents.includes(eventId)) {
      return sendForbidden(res, "You are not assigned to this event");
    }

    // Build query
    const query = { eventId: eventId };
    if (status) {
      query.status = status;
    }

    // Fetch total count for pagination
    const total = await Ticket.countDocuments(query);

    // Fetch tickets with pagination
    const tickets = await Ticket.find(query)
      .populate({
        path: "ticketId",
        select: "username email mobile",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // latest tickets first

    //Modify response
    const safeTickets = tickets.map((t) => ({
      ticketId: t.ticketId,
      status: t.status,
      isScanned: t.isScanned,
      scannedAt: t.scannedAt || null,
    }));

    // Response
    return sendSuccess(
      res,
      {
        total,
        page,
        limit,
        tickets: safeTickets,
      },
      "Tickets for your assigned events"
    );
  } catch (error) {
    console.error("Get my tickets error:", error);
    return sendError(res, "Failed to fetch tickets");
  }
};

//Ticket Checker ka Live Event Check-in Dashboard
export const getEventStatsForChecker = async (req, res) => {
  try {
    const checkerId = req.user._id;
    const { eventId } = req.params;

    // Validate ticket checker
    const checker = await User.findById(checkerId);
    if (!checker || checker.role !== "ticketChecker") {
      return sendForbidden(res, "Only Ticket Checkers can access stats");
    }

    // Check if this event is assigned to checker
    const assignedEvents = checker.ticketCheckerInfo?.assignedEvents || [];
    if (!assignedEvents.includes(eventId)) {
      return sendForbidden(res, "You are not assigned to this event");
    }

    // Query Conditions
    const baseQuery = { eventId };

    // Total tickets
    const totalTickets = await Ticket.countDocuments(baseQuery);

    // Checked In tickets
    const checkedIn = await Ticket.countDocuments({
      ...baseQuery,
      isScanned: true,
    });

    // Not Checked In tickets
    const notCheckedIn = totalTickets - checkedIn;

    // Cancelled tickets (if used)
    const cancelled = await Ticket.countDocuments({
      ...baseQuery,
      status: "canceled",
    });

    // Today's Check-ins
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCheckins = await Ticket.countDocuments({
      ...baseQuery,
      isScanned: true,
      scannedAt: { $gte: startOfDay },
    });

    // Response
    return sendSuccess(
      res,
      {
        totalTickets,
        checkedIn,
        notCheckedIn,
        cancelled,
        todayCheckins,
      },
      "Event stats fetched successfully"
    );
  } catch (error) {
    console.error("Stats API Error:", error);
    return sendError(res, "Failed to fetch event stats");
  }
};

//search tickets
export const searchTicketForChecker = async (req, res) => {
  try {
    const checkerId = req.user._id;
    const { eventId } = req.params;

    const q = sanitizeInput(req.query.q || ""); // better: ?q=
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const sortBy = sanitizeInput(req.query.sortBy || "createdAt");
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return sendError(res, "Invalid eventId");
    }

    // STEP 1: CHECK IF CHECKER IS ASSIGNED TO EVENT
    const event = await Event.findById(eventId).select("assignedCheckers");
    if (!event) return sendNotFound(res, "Event not found");

    let isAssigned = event.assignedCheckers?.some(
      (id) => id.toString() === checkerId.toString()
    );

    if (!isAssigned) {
      const user = await User.findById(checkerId).select(
        "ticketCheckerInfo.assignedEvents"
      );

      isAssigned = user.ticketCheckerInfo?.assignedEvents?.some(
        (id) => id.toString() === eventId.toString()
      );
    }

    if (!isAssigned) {
      return sendForbidden(res, "You are not assigned to this event");
    }

    // STEP 2: BUILD SEARCH FILTER (Correct Schema)
    let filter = { eventId }; // your schema uses eventId not event

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      filter = {
        eventId,
        $or: [
          { ticketId: regex }, // UUID QR
          { status: regex }, // booked/cancelled
          { isScanned: q === "scanned" }, // keyword search
          { price: !isNaN(q) ? Number(q) : undefined },
        ],
      };
    }

    // STEP 3: SAFE PROJECTION
    const projection = {
      ticketId: 1,
      eventId: 1,
      userId: 1,
      price: 1,
      status: 1,
      isScanned: 1,
      scannedAt: 1,
      scannedBy: 1,
      createdAt: 1,
    };

    // STEP 4: PAGINATION + SORT
    const total = await Ticket.countDocuments(filter);

    const tickets = await Ticket.find(filter, projection)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return sendSuccess(res,{
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      tickets,
    },"Tickets fetched successfully");
  } catch (error) {
    console.error("searchTicketForChecker Error:", error);
    return sendError(res, "Server error");
  }
};
