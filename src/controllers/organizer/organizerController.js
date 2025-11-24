import User from "../../models/user.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendConflict,
  sendForbidden,
} from "../../utils/responseHandler.js";

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
