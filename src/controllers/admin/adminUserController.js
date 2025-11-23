// import User from "../../models/user.js";

// import {
//   sendSuccess,
//   sendError,
//   sendNotFound,
//   sendValidationError,
//   sendConflict,
// } from "../../utils/responseHandler.js";

// import { validateObjectId, validateRole } from "../../validation/validation.js";

// /**
//  * @desc Get all users
//  * @route GET /admin/users
//  */
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password -refreshToken");

//     return sendSuccess(res, users, "All users fetched successfully");
//   } catch (error) {
//     console.error("Get all users error:", error);
//     return sendError(res, "Error fetching users");
//   }
// };

// /**
//  * @desc Get user by ID
//  * @route GET /admin/users/:id
//  */
// export const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!validateObjectId(id)) {
//       return sendValidationError(res, [
//         { field: "id", message: "Invalid User ID" },
//       ]);
//     }

//     const user = await User.findById(id).select("-password -refreshToken");

//     if (!user) {
//       return sendNotFound(res, "User not found");
//     }

//     return sendSuccess(res, user, "User details fetched");
//   } catch (error) {
//     console.error("Get user by Id Error:", error);
//     return sendError(res, "Error fetching user details");
//   }
// };

// /**
//  * @desc Update user role
//  * @route PATCH /admin/users/:id/role
//  */
// export const updateUserRole = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { role } = req.body;

//     if (!validateObjectId(id)) {
//       return sendValidationError(res, [
//         { field: "id", message: "Invalid User ID" },
//       ]);
//     }

//     const roleCheck = validateRole(role);
//     if (!roleCheck.isValid) {
//       return sendValidationError(res, [
//         { field: "role", message: roleCheck.message },
//       ]);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { role },
//       { new: true }
//     ).select("-password -refreshToken");

//     if (!updatedUser) {
//       return sendNotFound(res, "User not found");
//     }

//     return sendSuccess(res, updatedUser, "User role updated successfully");
//   } catch (error) {
//     console.error("User role update error:", error);
//     return sendError(res, "Failed to update user role");
//   }
// };

// /**
//  * @desc Block / Unblock user
//  * @route PATCH /admin/users/updateActiveStatus/:id/status
//  */
// export const updateActiveStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isActive } = req.body; // true / false

//     if (!validateObjectId(id)) {
//       return sendValidationError(res, [
//         { field: "id", message: "Invalid User ID" },
//       ]);
//     }

//     if (typeof isActive !== "boolean") {
//       return sendValidationError(res, [
//         { field: "isActive", message: "isActive must be boolean" },
//       ]);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { isActive },
//       { new: true }
//     ).select("-password -refreshToken");

//     if (!updatedUser) {
//       return sendNotFound(res, "User not found");
//     }

//     const msg = isActive
//       ? "User unblocked successfully"
//       : "User blocked successfully";

//     return sendSuccess(res, updatedUser, msg);
//   } catch (error) {
//     console.error("Update user status error:", error);
//     return sendError(res, "Failed to update user status");
//   }
// };

// /**
//  * @desc update role status
//  * @route PATCH /admin/users/updateRoleStatus/:id/
//  */
// export const updateRoleStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const user = await User.findById(id);

//     if (!user) return sendNotFound(res, "User not found");

//     // Organizer
//     if (user.role === "organizer") {
//       user.organizerInfo.status = status;
//     }

//     // Ticket Checker
//     if (user.role === "ticketChecker") {
//       user.ticketCheckerInfo.status = status;
//     }

//     await user.save();

//     return sendSuccess(res, user, "Role-based status updated");
//   } catch (error) {
//     console.error("Update role status error:", error);
//     return sendError(res, "Failed to update user status");
//   }
// };

// /**
//  * @desc Delete user
//  * @route DELETE /admin/users/:id
//  */
// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!validateObjectId(id)) {
//       return sendValidationError(res, [
//         { field: "id", message: "Invalid User ID" },
//       ]);
//     }

//     const user = await User.findByIdAndDelete(id);

//     if (!user) {
//       return sendNotFound(res, "User not found");
//     }

//     return sendSuccess(res, null, "User deleted successfully");
//   } catch (error) {
//     console.error("Delete user error:", error);
//     return sendError(res, "Error deleting user");
//   }
// };



import mongoose from "mongoose";
import User from "../../models/user.js";

import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
  sendConflict,
  sendForbidden,
} from "../../utils/responseHandler.js";

import {
  validateObjectId,
  validateRole,
} from "../../validation/validation.js";

/**
 * Allowed statuses for role-based entities
 */
const ORGANIZER_STATUSES = ["pending", "approved", "rejected"];
const TICKET_CHECKER_STATUSES = ["pending", "approved", "blocked"];

/**
 * @desc GET /admin/users
 * @query page, limit, q (search), role, sortBy (e.g. createdAt:desc)
 * Returns paginated list of users (without password/refreshToken)
 */
export const getAllUsers = async (req, res) => {
  try {
    // Pagination + filters + search
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const { q, role, isActive } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (typeof isActive !== "undefined") {
      // accept 'true' / 'false' as string
      if (isActive === "true" || isActive === "false") {
        filter.isActive = isActive === "true";
      }
    }

    if (q) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [{ username: regex }, { email: regex }, { mobile: regex }];
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      // expect format field:asc or field:desc
      const [field, dir] = req.query.sortBy.split(":");
      sort = { [field]: dir === "asc" ? 1 : -1 };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationExpires")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    const meta = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    return sendSuccess(res, { items: users, meta }, "Users fetched successfully");
  } catch (error) {
    console.error("getAllUsers error:", error);
    return sendError(res, "Error fetching users");
  }
};

/**
 * @desc GET /admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return sendValidationError(res, [{ field: "id", message: "Invalid User ID" }]);
    }

    const user = await User.findById(id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

    if (!user) return sendNotFound(res, "User not found");

    return sendSuccess(res, user, "User details fetched");
  } catch (error) {
    console.error("getUserById error:", error);
    return sendError(res, "Error fetching user details");
  }
};

/**
 * @desc PATCH /admin/users/:id/role
 * body: { role: "organizer" }
 * NOTE: We disallow assigning 'admin' role via this endpoint to avoid privilege escalation.
 */
export const updateUserRole = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    let { role } = req.body;
    role = typeof role === "string" ? role.trim() : role;

    if (!validateObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "id", message: "Invalid User ID" }]);
    }

    const roleCheck = validateRole(role);
    if (!roleCheck.isValid) {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "role", message: roleCheck.message }]);
    }

    // Prevent assigning admin via this endpoint to avoid accidental privilege escalation
    if (role === "admin") {
      await session.abortTransaction();
      session.endSession();
      return sendForbidden(res, "Assigning admin role is not allowed via this endpoint");
    }

    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFound(res, "User not found");
    }

    const oldRole = user.role;
    if (oldRole === role) {
      await session.commitTransaction();
      session.endSession();
      return sendSuccess(res, user, "User already has the requested role");
    }

    // Update role and clear role-specific data if role changes
    user.role = role;

    if (role !== "organizer") {
      user.organizerInfo = undefined;
    } else {
      // ensure organizerInfo exists
      user.organizerInfo = user.organizerInfo || { status: "pending" };
    }

    if (role !== "ticketChecker") {
      user.ticketCheckerInfo = undefined;
    } else {
      user.ticketCheckerInfo = user.ticketCheckerInfo || { status: "pending" };
    }

    // Optional: if demoting from elevated role, also revoke sensitive tokens / sessions
    user.refreshToken = undefined;

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    const out = await User.findById(id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

    return sendSuccess(res, out, `User role changed from '${oldRole}' to '${role}' successfully`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateUserRole error:", error);
    return sendError(res, "Failed to update user role");
  }
};

/**
 * @desc PATCH /admin/users/updateActiveStatus/:id
 * body: { isActive: true/false }
 */
export const updateActiveStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!validateObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "id", message: "Invalid User ID" }]);
    }

    if (typeof isActive !== "boolean") {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "isActive", message: "isActive must be boolean" }]);
    }

    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFound(res, "User not found");
    }

    // Prevent admin from accidentally blocking themselves (optional)
    if (req.user && req.user._id && req.user._id.equals(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return sendForbidden(res, "Admin cannot change their own active status");
    }

    user.isActive = isActive;
    // On block, revoke refresh token
    if (!isActive) user.refreshToken = undefined;

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    const out = await User.findById(id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

    const msg = isActive ? "User unblocked successfully" : "User blocked successfully";
    return sendSuccess(res, out, msg);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateActiveStatus error:", error);
    return sendError(res, "Failed to update active status");
  }
};

/**
 * @desc PATCH /admin/users/updateRoleStatus/:id
 * body: { status: "approved" }
 * Updates organizerInfo.status OR ticketCheckerInfo.status depending on user's role.
 */
export const updateRoleStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "id", message: "Invalid User ID" }]);
    }

    if (!status || typeof status !== "string") {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "status", message: "Status is required" }]);
    }

    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFound(res, "User not found");
    }

    if (user.role === "organizer") {
      if (!ORGANIZER_STATUSES.includes(status)) {
        await session.abortTransaction();
        session.endSession();
        return sendValidationError(res, [{ field: "status", message: `Invalid organizer status. Allowed: ${ORGANIZER_STATUSES.join(", ")}` }]);
      }
      user.organizerInfo = user.organizerInfo || {};
      user.organizerInfo.status = status;
    } else if (user.role === "ticketChecker") {
      if (!TICKET_CHECKER_STATUSES.includes(status)) {
        await session.abortTransaction();
        session.endSession();
        return sendValidationError(res, [{ field: "status", message: `Invalid ticketChecker status. Allowed: ${TICKET_CHECKER_STATUSES.join(", ")}` }]);
      }
      user.ticketCheckerInfo = user.ticketCheckerInfo || {};
      user.ticketCheckerInfo.status = status;
    } else {
      await session.abortTransaction();
      session.endSession();
      return sendForbidden(res, "Role-based status allowed only for organizer or ticketChecker");
    }

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

    const out = await User.findById(id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpires");

    return sendSuccess(res, out, "Role-based status updated");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("updateRoleStatus error:", error);
    return sendError(res, "Failed to update role status");
  }
};

/**
 * @desc DELETE /admin/users/:id
 */
export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      await session.abortTransaction();
      session.endSession();
      return sendValidationError(res, [{ field: "id", message: "Invalid User ID" }]);
    }

    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFound(res, "User not found");
    }

    // Prevent deleting self
    if (req.user && req.user._id && req.user._id.equals(user._id)) {
      await session.abortTransaction();
      session.endSession();
      return sendForbidden(res, "Admin cannot delete their own account");
    }

    await User.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return sendSuccess(res, null, "User deleted successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("deleteUser error:", error);
    return sendError(res, "Error deleting user");
  }
};

