import Ticket from "../models/Ticket.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
} from "../utils/responseHandler.js";

//QR Verify API (for scanner UI to preview validity)
export const verifyTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ ticketId }).populate(
      "eventId userId"
    );
    if (!ticket) return sendNotFound(res, "Invalid ticket");

    // return minimal info for scanner preview
    return sendSuccess(
      res,
      {
        ticketId: ticket.ticketId,
        eventId: ticket.eventId._id,
        eventTitle: ticket.eventId.title,
        userName: ticket.userId.username,
        isScanned: ticket.isScanned,
        status: ticket.status,
      },
      "Ticket fetched"
    );
  } catch (err) {
    console.error("Ticket verify error:", err);
    return sendError(res, "Error verifying ticket");
  }
};

/*
Check-in API (atomic, prevents race conditions)
important: do atomic update so two scanners can't mark same ticket twice.
*/
export const checkinTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    // Only staff/organizer should call this
    if (!["organizer", "ticketChecker", "admin"].includes(req.user.role))
      return sendError(res, "Not authorized", 403);

    // Atomically set isScanned only if it is false
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId, isScanned: false },
      {
        $set: {
          isScanned: true,
          scannedAt: new Date(),
          scannedBy: req.user._id,
        },
      },
      { new: true }
    );

    if (!ticket) {
      // either invalid id OR already scanned
      const existing = await Ticket.findOne({ ticketId });
      if (!existing) return sendNotFound(res, "Ticket not found");
      return sendError(res, "Ticket already scanned", 400);
    }

    return sendSuccess(res, ticket, "Check-in successful");
  } catch (err) {
    console.error("checkinTicket:", err);
    return sendError(res, "Error during check-in");
  }
};
