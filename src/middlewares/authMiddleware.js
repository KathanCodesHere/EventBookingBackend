import User from "../models/user.js";
import { verifyAccessToken } from "../utils/jwtUtils.js";
import { sendUnauthorized, sendForbidden } from "../utils/responseHandler.js";

/**
 * Authentication middleware - Check if user is logged in
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return sendUnauthorized(res, "Access token not found. Please login.");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-refreshToken");

    if (!user || !user.isActive) {
      return sendUnauthorized(res, "User not found or inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendUnauthorized(res, "Invalid or expired token");
  }
};

/**
 * Authorization middleware - Check user role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Required role: ${roles.join(" or ")}`
      );
    }

    next();
  };
};

/**
 * Verify user status middleware - Check if user is verified
 */
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "Authentication required");
  }

  if (!req.user.isVerified) {
    return sendForbidden(
      res,
      "Account verification required. Please complete your profile."
    );
  }

  next();
};
