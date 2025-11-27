import Event from "../models/Event.js";
import User from "../models/user.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responseHandler.js";
import {
  validateRequired,
  validateObjectId,
} from "../validation/validation.js";

//user routes
//get ALL events public
export const getAllEventsPublic = async (req, res) => {
  try {
    // Optional filters → city, date, search, category
    const { city, search, category } = req.query;

    const filter = {
      status: "active", // only approved / public events
    };

    if (city) filter["location.city"] = city;
    if (category) filter.category = category;

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const events = await Event.find(filter)
      .select(
        "title description date price images location eventCategory createdAt"
      )
      .sort({ date: 1 }); // nearest events first

    return sendSuccess(res, events, "All events fetched");
  } catch (err) {
    return sendError(res, "Error fetching events");
  }
};

//get single event public
export const getSingleEventPublic = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!validateObjectId(eventId))
      return sendValidationError(res, [
        { field: "eventId", message: "Invalid Event ID" },
      ]);

    const event = await Event.findOne({
      _id: eventId,
      status: "active",
    }).select(
      "title description date price images location eventCategory createdAt"
    );

    if (!event) return sendNotFound(res, "Event not found");

    return sendSuccess(res, event, "Event fetched");
  } catch (err) {
    console.error("get single event error:", err);
    return sendError(res, "error fetching single event");
  }
};

// Add Event to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    // Validation
    const errors = [];
    validateRequired(eventId, "eventId", errors);
    validateObjectId(eventId, "eventId", errors);

    if (!userId)
      errors.push({ field: "auth", message: "User not authenticated" });

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) return sendNotFound(res, "Event not found");

    // Add to wishlist if not already present
    const user = await User.findById(userId);

    if (user.wishlist?.includes(eventId)) {
      return sendError(res, "Event already in wishlist");
    }

    user.wishlist = user.wishlist || [];
    user.wishlist.push(eventId);
    await user.save();

    return sendSuccess(res, null, "Event added to wishlist");
  } catch (err) {
    console.log(err);
    return sendError(res, "Something went wrong");
  }
};

// Get My Wishlist
export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId)
      return sendValidationError(res, [
        { field: "auth", message: "User not authenticated" },
      ]);

    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: "title description date price location thumbnail",
      })
      .select("wishlist");

    return sendSuccess(res, user.wishlist, "Wishlist fetched successfully");
  } catch (err) {
    console.log(err);
    return sendError(res, "Something went wrong");
  }
};

// REMOVE event from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const errors = [];
    validateRequired(eventId, "eventId", errors);
    validateObjectId(eventId, "eventId", errors);

    if (!userId)
      errors.push({ field: "auth", message: "User not authenticated" });

    if (errors.length > 0) return sendValidationError(res, errors);

    const user = await User.findById(userId);

    if (!user.wishlist?.includes(eventId)) {
      return sendError(res, "Event not in wishlist");
    }

    // Remove event
    user.wishlist = user.wishlist.filter((id) => id.toString() !== eventId);
    await user.save();

    return sendSuccess(res, null, "Event removed from wishlist");
  } catch (err) {
    console.log(err);
    return sendError(res, "Something went wrong");
  }
};

// TOGGLE wishlist (Add if not present, Remove if present)
export const toggleWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id;

    const errors = [];
    validateRequired(eventId, "eventId", errors);
    validateObjectId(eventId, "eventId", errors);

    if (!userId)
      errors.push({ field: "auth", message: "User not authenticated" });

    if (errors.length > 0) return sendValidationError(res, errors);

    const event = await Event.findById(eventId);
    if (!event) return sendNotFound(res, "Event not found");

    const user = await User.findById(userId);

    if (!user.wishlist) user.wishlist = [];

    // If exists → remove
    if (user.wishlist.includes(eventId)) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== eventId);
      await user.save();

      return sendSuccess(
        res,
        { inWishlist: false },
        "Event removed from wishlist"
      );
    }

    // If not exists → add
    user.wishlist.push(eventId);
    await user.save();

    return sendSuccess(res, { inWishlist: true }, "Event added to wishlist");
  } catch (err) {
    console.log(err);
    return sendError(res, "Something went wrong");
  }
};

// WISHLIST ANALYTICS → Count total wishlist items
export const getWishlistAnalytics = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId)
      return sendValidationError(res, [
        { field: "auth", message: "User not authenticated" },
      ]);

    const user = await User.findById(userId).select("wishlist");

    const totalWishlistedEvents = user.wishlist?.length || 0;

    return sendSuccess(
      res,
      { count: totalWishlistedEvents },
      "Wishlist analytics fetched"
    );
  } catch (err) {
    console.log(err);
    return sendError(res, "Something went wrong");
  }
};
