import express from "express";
import {
  getAllEventsPublic,
  getSingleEventPublic,
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  toggleWishlist,
  getWishlistAnalytics,
} from "../controllers/userController.js";

import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();
/*======================USER_EVENTS_ROUTES==================*/

//get all events public route
router.get("/getAllEvents", getAllEventsPublic);

//get single event public route
router.get("/getSingleEventPublic/:eventId", getSingleEventPublic);

//add to wishlist event
router.post("/addToWishList/:eventId", authenticate, addToWishlist);

//get my wishlist
router.get("/getMyWishList", authenticate, getMyWishlist);

// Remove from wishlist
router.delete("/removeFromWishList/:eventId", authenticate, removeFromWishlist);

// Toggle wishlist (add/remove in one API)
router.post("toggleWishList/:eventId", authenticate, toggleWishlist);

// Wishlist Analytics (total count)
router.get("/getWishListAnalytics", authenticate, getWishlistAnalytics);

export default router;
