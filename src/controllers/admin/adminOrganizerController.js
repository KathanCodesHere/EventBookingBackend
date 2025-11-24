import {
  fetchPendingRequestsService,
  fetchRequestByIdService,
  updateOrganizerStatusService,
} from "../../services/adminOrganizerService.js";

import { sendSuccess, sendError } from "../../utils/responseHandler.js";

/*
GET ALL PENDING ORGANIZER REQUESTS
*/
export const getPendingOrganizerRequests = async (req, res) => {
  try {
    const pending = await fetchPendingRequestsService();
    return sendSuccess(res, pending, "Pending organizer requests fetched");
  } catch (err) {
    console.log("Pending Requests Error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};

/*
 GET ORGANIZER REQUEST BY ID
*/
export const getOrganizerRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await fetchRequestByIdService(id);

    if (!user) return sendError(res, "Request not found", 404);

    return sendSuccess(res, user, "Organizer request fetched successfully");
  } catch (err) {
    console.log("Fetch by ID Error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};

/*
APPROVE / REJECT ORGANIZER REQUEST
*/
export const updateOrganizerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["approved", "rejected"].includes(status))
      return sendError(res, "Invalid status value", 400);

    const updatedUser = await updateOrganizerStatusService(
      id,
      status,
      reason || null
    );

    if (!updatedUser) return sendError(res, "User not found", 404);

    return sendSuccess(
      res,
      updatedUser,
      `Organizer request ${status} successfully`
    );
  } catch (err) {
    console.log("Update Status Error:", err);
    return sendError(res, "Something went wrong", 500);
  }
};
