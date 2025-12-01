import mongoose from "mongoose";
import User from "../models/user.js";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendConflict,
  sendForbidden,
} from "../utils/responseHandler.js";

/**
 * POST /api/organizer/apply
 * Auth: user must be logged in (role stays "user" until admin approves)
 */

export const applyOrganizer = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return sendValidationError(res, [
        { field: "auth", message: "User not authenticated" },
      ]);

    // Fetch logged-in user
    const user = await User.findById(userId);
    if (!user) return sendNotFound(res, "User not found");

    // Add this check RIGHT HERE
    // if (!user.isVerified) {
    //   return sendConflict(
    //     res,
    //     "Please verify your email before applying as organizer"
    //   );
    // }

    // Block if already approved organizer
    if (
      user.role === "organizer" &&
      user.organizerInfo?.status === "approved"
    ) {
      return sendConflict(res, "You are already an approved organizer");
    }

    // Block if already pending
    if (user.organizerInfo?.status === "pending") {
      return sendConflict(
        res,
        "Organizer request already pending. Please wait for admin approval."
      );
    }

    // Organizer request should ALWAYS use user's existing email/mobile
    user.organizerInfo = {
      email: user.email,
      mobile: user.mobile,
      organizerRequest: true,
      status: "pending",
    };

    await user.save();

    const out = await User.findById(userId).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
    );

    return sendSuccess(
      res,
      out,
      "Organizer application submitted successfully. Awaiting admin approval."
    );
  } catch (error) {
    console.error("applyOrganizer error:", error);
    return sendError(res, "Failed to submit organizer application");
  }
};

/**
 * GET /api/organizer/status
 * Returns current user's organizer info & status
 */
export const getOrganizerStatus = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId)
      return sendValidationError(res, [
        { field: "auth", message: "User not authenticated" },
      ]);

    const user = await User.findById(userId).select("role organizerInfo");
    if (!user) return sendNotFound(res, "User not found");

    // Block users who never applied as organizer
    if (!user.organizerInfo?.organizerRequest) {
      return sendForbidden(res, "You have not applied to become an organizer");
    }

    return sendSuccess(
      res,
      { role: user.role, organizerInfo: user.organizerInfo || null },
      "Organizer status fetched"
    );
  } catch (error) {
    console.error("getOrganizerStatus error:", error);
    return sendError(res, "Failed to fetch organizer status");
  }
};

//organizer dashboard analytics
export const organizerDashboardAnalytics = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Step 1: Get all events of this organizer
    const events = await Event.find({ organizerId }, { _id: 1 });

    const eventIds = events.map((e) => e._id);

    // If no events, directly return 0 data
    if (eventIds.length === 0) {
      return sendSuccess(
        res,
        {
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0,
          ticketsSold: 0,
          totalRevenue: 0,
        },
        "Organizer Dashboard Analytics"
      );
    }
    // 1) Total Events
    const totalEvents = eventIds.length;

    // 2) Upcoming & Past Events
    const today = new Date();

    const upcomingEvents = await Event.countDocuments({
      organizerId,
      date: { $gte: today },
    });

    const pastEvents = await Event.countDocuments({
      organizerId,
      date: { $lt: today },
    });

    // 3) Total Tickets Sold
    const ticketsSold = await Ticket.countDocuments({
      eventId: { $in: eventIds },
      status: "booked",
    });

    // 4) Total Revenue
    const revenueData = await Ticket.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: "booked",
        },
      },
      {
        $group: { _id: null, totalRevenue: { $sum: "$price" } },
      },
    ]);

    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    return sendSuccess(
      res,
      {
        totalEvents,
        upcomingEvents,
        pastEvents,
        ticketsSold,
        totalRevenue,
      },
      "Organizer Dashboard Analytics"
    );
  } catch (error) {
    console.error("Organizer Dashboard Analytics Error:", error);
    return sendError(res, "Error fetching dashboard analytics");
  }
};
