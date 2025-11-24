import User from "../models/user.js";

export const fetchPendingRequestsService = async () => {
  return await User.find({
    "organizerInfo.organizerRequest": true,
    "organizerInfo.status": "pending",
  }).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );
};

export const fetchRequestByIdService = async (id) => {
  return await User.findOne({
    _id: id,
    "organizerInfo.organizerRequest": true,
    "organizerInfo.status": "pending",
  }).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );
};

export const updateOrganizerStatusService = async (id, status, reason) => {
  const updateData = {
    "organizerInfo.status": status,
  };

  // If rejected, add reason
  if (status === "rejected") {
    updateData["organizerInfo.reason"] = reason;
  }

  // If approved, update role → organizer
  if (status === "approved") {
    updateData["role"] = "organizer";
  }

  return await User.findByIdAndUpdate(id, updateData, { new: true }).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpires"
  );
};
