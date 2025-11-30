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
